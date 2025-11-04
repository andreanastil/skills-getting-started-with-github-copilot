document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  let activitiesData = {};

  // Load activities when page loads
  document.addEventListener("DOMContentLoaded", function () {
    loadActivities();

    // Handle form submission
    document.getElementById("signup-form").addEventListener("submit", handleSignup);
  });

  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      activitiesData = await response.json();

      displayActivities();
      populateActivitySelect();
    } catch (error) {
      console.error("Error loading activities:", error);
      document.getElementById("activities-list").innerHTML = '<p class="error">Failed to load activities.</p>';
    }
  }

  function displayActivities() {
    let html = "";

    for (const [name, details] of Object.entries(activitiesData)) {
      html += `
            <div class="activity-card">
                <h4>${name}</h4>
                <p><strong>Description:</strong> ${details.description}</p>
                <p><strong>Schedule:</strong> ${details.schedule}</p>
                <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
                <div class="participants-section">
                    <strong>Current Participants:</strong>
                    ${details.participants.length > 0
          ? `<ul class="participants-list">
                             ${details.participants.map((email) => `<li>${email}</li>`).join("")}
                           </ul>`
          : '<p class="no-participants">No participants yet</p>'
        }
                </div>
            </div>
        `;
    }

    activitiesList.innerHTML = html;
  }

  function populateActivitySelect() {
    // Clear existing options except the first one
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    for (const activityName of Object.keys(activitiesData)) {
      const option = document.createElement("option");
      option.value = activityName;
      option.textContent = activityName;
      activitySelect.appendChild(option);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activityName = document.getElementById("activity").value;

    if (!email || !activityName) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(`Successfully signed up for ${activityName}!`, "success");
        // Reload activities to show updated participant list
        loadActivities();
        // Clear form
        signupForm.reset();
      } else {
        showMessage(result.detail || "Error signing up for activity.", "error");
      }
    } catch (error) {
      showMessage("Error connecting to server.", "error");
      console.error("Signup error:", error);
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Initialize app
  loadActivities();
});
