document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("birthdayForm");
  const submitBtn = form.querySelector('input[type="submit"]');

  // Set max date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dob").setAttribute("max", today);

  // Add loading state
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.value = isLoading ? "Submitting..." : "Submit";
  }

  // Show success message
  function showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    form.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }

  // Show error message
  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    form.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(true);

    // Remove any existing messages
    const existingMessages = form.querySelectorAll(
      ".success-message, .error-message"
    );
    existingMessages.forEach((msg) => msg.remove());

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess("Successful! You'll receive an email on your birthday🎉 Remember to check your mail :)");
        e.target.reset();
      } else {
        showError(result.error || "An error occurred. Please try again!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showError("Network error. Please check your connection and try again!");
    } finally {
      setLoading(false);
    }
  });
});