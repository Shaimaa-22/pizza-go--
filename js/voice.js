let recognition = null;
let callActive = false;
let isListening = false;
let isSpeaking = false;

function getCurrentLang() {
  return localStorage.getItem("pizza_go_lang") || "en";
}

function getVoiceLang() {
  return getCurrentLang() === "ar" ? "ar-SA" : "en-US";
}

function t(en, ar) {
  return getCurrentLang() === "ar" ? ar : en;
}

function startListening() {
  if (callActive) {
    stopCall();
    return;
  }

  startCall();
}

function startCall() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast(
      t(
        "Voice recognition works best in Chrome.",
        "التعرف على الصوت يعمل بشكل أفضل على متصفح Chrome."
      ),
      "error"
    );
    return;
  }

  recognition = new SpeechRecognition();

  recognition.lang = getVoiceLang();
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  callActive = true;

  updateVoiceButton(true);

  showToast(
    t(
      "Call started 🎙️",
      "تم بدء المكالمة 🎙️"
    )
  );

  recognition.onresult = async function (event) {
    isListening = false;

    const userText = event.results[0][0].transcript;
    console.log("User said:", userText);

    showToast(
      getCurrentLang() === "ar"
        ? `أنت: ${userText}`
        : `You: ${userText}`
    );

    try {
      const data = await apiFetch("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          message: userText,
          lang: getCurrentLang()
        }),
      });

      if (data.actions && Array.isArray(data.actions)) {
        data.actions.forEach((action) => handleVoiceAction(action));
      }

      if (data.action) {
        handleVoiceAction(data.action);
      }

      speak(
        data.reply ||
          t(
            "Okay.",
            "حسنًا."
          )
      );
    } catch (error) {
      console.error(error);

      speak(
        t(
          "Sorry, I could not connect to the assistant.",
          "عذرًا، لم أستطع الاتصال بالمساعد."
        )
      );

      showToast(error.message, "error");
    }
  };

  recognition.onerror = function (event) {
    console.log("Speech error:", event.error);
    isListening = false;

    if (callActive && !isSpeaking) {
      setTimeout(startRecognitionSafely, 900);
    }
  };

  recognition.onend = function () {
    isListening = false;

    if (callActive && !isSpeaking) {
      setTimeout(startRecognitionSafely, 700);
    }
  };

  speak(
    t(
      "Hi! Welcome to Pizza Go. What would you like to order today?",
      "مرحبًا بك في بيتزا جو، ماذا تريد أن تطلب اليوم؟"
    )
  );
}

function startRecognitionSafely() {
  if (!callActive || !recognition || isListening || isSpeaking) return;

  try {
    recognition.lang = getVoiceLang();
    recognition.start();
    isListening = true;

    showToast(
      t(
        "Listening... 🎙️",
        "جاري الاستماع 🎙️"
      )
    );
  } catch (error) {
    console.log("Recognition start ignored:", error.message);
  }
}

function speak(text) {
  if (!text) return;

  isSpeaking = true;
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = getVoiceLang();
  speech.rate = getCurrentLang() === "ar" ? 0.95 : 1;
  speech.pitch = 1;

  speech.onstart = function () {
    isSpeaking = true;
  };

  speech.onend = function () {
    isSpeaking = false;

    if (callActive) {
      setTimeout(startRecognitionSafely, 500);
    }
  };

  speech.onerror = function () {
    isSpeaking = false;

    if (callActive) {
      setTimeout(startRecognitionSafely, 700);
    }
  };

  window.speechSynthesis.speak(speech);
}

function stopCall() {
  callActive = false;
  isListening = false;
  isSpeaking = false;

  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.log(error.message);
    }
  }

  window.speechSynthesis.cancel();

  updateVoiceButton(false);

  showToast(
    t(
      "Call ended.",
      "تم إنهاء المكالمة."
    )
  );
}

function updateVoiceButton(active) {
  const btn = document.querySelector(".voice-btn");

  if (!btn) return;

  if (active) {
    btn.innerHTML = t(
      "🔴 End Call",
      "🔴 إنهاء المكالمة"
    );

    btn.classList.add("active-call");
  } else {
    btn.innerHTML = t(
      "🎙️ Voice Assistant",
      "🎙️ المساعد الصوتي"
    );

    btn.classList.remove("active-call");
  }
}

function handleVoiceAction(action) {
  if (!action) return;

  if (action.type === "end_call") {
    setTimeout(stopCall, 1200);
    return;
  }

  if (action.type === "add_topping") {
    const key = findToppingKey(action.topping);

    if (key) {
      state.toppingsSelection[key] = true;
      renderToppings();
      renderSummary();
      updatePizzaPreview();
    }
  }

  if (action.type === "remove_topping") {
    const key = findToppingKey(action.topping);

    if (key) {
      state.toppingsSelection[key] = false;
      renderToppings();
      renderSummary();
      updatePizzaPreview();
    }
  }

  if (action.type === "set_quantity") {
    state.quantity = Number(action.quantity) || 1;
    renderSummary();
  }

  if (action.type === "go_payment") {
    saveOrderToStorage();

    setTimeout(() => {
      window.location.href = "./payment.html";
    }, 1800);
  }

  if (action.type === "read_total") {
    const total =
      document.getElementById("totalPriceLabel")?.textContent || "";

    setTimeout(() => {
      speak(
        getCurrentLang() === "ar"
          ? `الإجمالي هو ${total}`
          : `Your total is ${total}.`
      );
    }, 700);
  }
}

function findToppingKey(spokenTopping) {
  const map = {
    olive: "Olive",
    olives: "Olive",
    زيتون: "Olive",
    الزيتون: "Olive",

    tomato: "Tomato",
    tomatoes: "Tomato",
    طماطم: "Tomato",
    بندورة: "Tomato",
    البندورة: "Tomato",

    mushroom: "Mushroom",
    mushrooms: "Mushroom",
    فطر: "Mushroom",
    مشروم: "Mushroom",
    المشروم: "Mushroom",
  };

  const wanted = map[String(spokenTopping).toLowerCase().trim()];

  if (!wanted) return null;

  return Object.keys(state.toppingsSelection).find(
    (name) => name.toLowerCase() === wanted.toLowerCase()
  );
}
