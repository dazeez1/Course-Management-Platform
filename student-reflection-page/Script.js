// Enhanced translations object with Yoruba
const translations = {
  en: {
    title: "Course Reflection",
    greeting:
      "Welcome! Please take a moment to reflect on your learning journey and share your thoughts about the course.",
    question1: "Question 1",
    question1Text:
      "What did you enjoy most about the course? What aspects of the learning experience were most valuable to you?",
    question2: "Question 2",
    question2Text:
      "What was the most challenging part of the course? How did you overcome these challenges?",
    question3: "Question 3",
    question3Text:
      "What could be improved in the course? What suggestions do you have for future students or instructors?",
    submit: "Submit Reflection",
    placeholder: "Share your thoughts here...",
    successTitle: "Thank You!",
    successMessage:
      "Your reflection has been submitted successfully. Your feedback is valuable to us and will help improve the course for future students.",
    close: "Close",
  },
  fr: {
    title: "Réflexion du Cours",
    greeting:
      "Bienvenue ! Prenez un moment pour réfléchir à votre parcours d'apprentissage et partagez vos réflexions sur le cours.",
    question1: "Question 1",
    question1Text:
      "Qu'avez-vous le plus apprécié dans ce cours ? Quels aspects de l'expérience d'apprentissage vous ont été les plus précieux ?",
    question2: "Question 2",
    question2Text:
      "Quelle a été la partie la plus difficile du cours ? Comment avez-vous surmonté ces défis ?",
    question3: "Question 3",
    question3Text:
      "Que pourrait-on améliorer dans le cours ? Quelles suggestions avez-vous pour les futurs étudiants ou instructeurs ?",
    submit: "Soumettre la Réflexion",
    placeholder: "Partagez vos réflexions ici...",
    successTitle: "Merci !",
    successMessage:
      "Votre réflexion a été soumise avec succès. Vos commentaires nous sont précieux et aideront à améliorer le cours pour les futurs étudiants.",
    close: "Fermer",
  },
  yo: {
    title: "Ìròyìn Kọ́ọ̀sì",
    greeting:
      "Káàbọ̀! Jọ̀ọ́ kí a fẹ́ẹ́rẹ́ ṣàlàyé nípa ìrìn-àjò ẹ̀kọ́ rẹ̀ àti kí o pín ìròyìn rẹ̀ nípa kọ́ọ̀sì náà.",
    question1: "Ìbéèrè 1",
    question1Text:
      "Kí ni o gbàdùn jù lọ nínú kọ́ọ̀sì náà? Àwọn ìpín wo nínú ìrírí ẹ̀kọ́ náà ni o ṣe pàtàkì jù fún ọ?",
    question2: "Ìbéèrè 2",
    question2Text:
      "Kí ni ìpín tí ó ṣòro jù nínú kọ́ọ̀sì náà? Báwo ni o ṣe ṣàlàyé àwọn ìṣòro yìí?",
    question3: "Ìbéèrè 3",
    question3Text:
      "Kí ni a lè ṣe láti mú kọ́ọ̀sì náà dára si? Kí ni ìdámọ̀ rẹ̀ fún àwọn ọmọ ilé-ẹ̀kọ́ tàbí àwọn olùkọ́ tí yóò wà ní ọjọ́ iwájú?",
    submit: "Firanṣẹ́ Ìròyìn",
    placeholder: "Pín ìròyìn rẹ̀ níbí...",
    successTitle: "O ṣeun!",
    successMessage:
      "Ìròyìn rẹ̀ ti firanṣẹ́ nígbàgbọ́. Ìdáhùn rẹ̀ ṣe pàtàkì fún wa àti yóò ṣe iranlọwọ́ láti mú kọ́ọ̀sì náà dára si fún àwọn ọmọ ilé-ẹ̀kọ́ tí yóò wà ní ọjọ́ iwájú.",
    close: "Tí",
  },
};

let currentLanguage = "en";

// Browser language detection
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0].toLowerCase();

  // Check if browser language is supported
  if (translations[langCode]) {
    return langCode;
  }

  // Fallback to English
  return "en";
}

// Load saved language preference or detect browser language
function loadLanguagePreference() {
  const savedLang = localStorage.getItem("reflectionPageLanguage");
  if (savedLang && translations[savedLang]) {
    return savedLang;
  }
  return detectBrowserLanguage();
}

// Save language preference
function saveLanguagePreference(lang) {
  localStorage.setItem("reflectionPageLanguage", lang);
}

// Switch language function
function switchLanguage(lang) {
  if (!translations[lang]) return;

  currentLanguage = lang;
  saveLanguagePreference(lang);

  // Update dropdown selection
  document.getElementById("languageSelect").value = lang;

  // Update content
  updateContent();

  // Add fade animation
  const container = document.querySelector(".container");
  container.style.opacity = "0";
  setTimeout(() => {
    updateContent();
    container.style.opacity = "1";
  }, 150);
}

function updateContent() {
  const t = translations[currentLanguage];

  // Update title
  document.querySelector(".title").textContent = t.title;

  // Update greeting
  document.querySelector(".greeting").textContent = t.greeting;

  // Update questions
  const questions = document.querySelectorAll(".question-title");
  questions[0].textContent = t.question1;
  questions[1].textContent = t.question2;
  questions[2].textContent = t.question3;

  // Update question texts
  const questionTexts = document.querySelectorAll(".question-text");
  questionTexts[0].textContent = t.question1Text;
  questionTexts[1].textContent = t.question2Text;
  questionTexts[2].textContent = t.question3Text;

  // Update submit button
  document.querySelector(".submit-btn").textContent = t.submit;

  // Update placeholders
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach((textarea) => {
    textarea.placeholder = t.placeholder;
  });

  // Update language label
  const languageLabel = document.querySelector(".language-label");
  languageLabel.textContent = t.languageLabel;

  // Update success modal content
  const successTitle = document.querySelector(".success-title");
  const successMessage = document.querySelector(".success-message");
  const successBtn = document.querySelector(".success-btn");

  if (successTitle) successTitle.textContent = t.successTitle;
  if (successMessage) successMessage.textContent = t.successMessage;
  if (successBtn) successBtn.textContent = t.close;

  // Update document language
  document.documentElement.lang = currentLanguage;
}

// Show success modal
function showSuccessModal() {
  const overlay = document.getElementById("successOverlay");
  overlay.classList.add("show");
}

// Close success modal
function closeSuccessModal() {
  const overlay = document.getElementById("successOverlay");
  overlay.classList.remove("show");
}

// Clear form
function clearForm() {
  const textareas = document.querySelectorAll("textarea");
  textareas.forEach((textarea) => {
    textarea.value = "";
  });
}

// Handle dropdown change
document
  .getElementById("languageSelect")
  .addEventListener("change", function (e) {
    switchLanguage(e.target.value);
  });

// Handle form submission
document
  .getElementById("reflectionForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Disable submit button
    const submitBtn = document.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent =
      currentLanguage === "en"
        ? "Submitting..."
        : currentLanguage === "fr"
        ? "Soumission..."
        : "Firanṣẹ́...";

    const textareas = this.querySelectorAll("textarea");
    const responses = Array.from(textareas).map((textarea, index) => ({
      question: index + 1,
      response: textarea.value,
    }));

    // In a real application, you would send this data to your backend
    console.log("Reflection submitted:", {
      language: currentLanguage,
      responses: responses,
    });

    // Simulate API call delay
    setTimeout(() => {
      // Clear the form
      clearForm();

      // Show success modal
      showSuccessModal();

      // Re-enable submit button
      submitBtn.disabled = false;
      updateContent(); // This will restore the button text
    }, 1000);
  });

// Initialize with saved preference or detected language
currentLanguage = loadLanguagePreference();
document.getElementById("languageSelect").value = currentLanguage;
updateContent();
