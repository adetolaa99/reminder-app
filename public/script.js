document
  .getElementById("birthdayForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
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

      if (response.ok) {
        alert("You've successfully submitted your details!");
        e.target.reset();
      } else {
        const result = await response.json();
        alert(result.error || "An error occurred, Please try again!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form!");
    }
  });
