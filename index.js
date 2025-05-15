document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql';

            const headers = new Headers();
            headers.append("Content-Type", "application/json");

            const graphqlQuery = JSON.stringify({
                query: `
                    query getUserProfile($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                                totalSubmissionNum {
                                    difficulty
                                    submission
                                }
                            }
                        }
                    }
                `,
                variables: { username: username }
            });

            const requestOptions = {
                method: "POST",
                headers: headers,
                body: graphqlQuery,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the user details");
            }
            const data = await response.json();
            console.log("Logging data:", data);

            displayUserData(data);
        } catch (error) {
            console.error(error);
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const totalQuestions = parsedData.data.allQuestionsCount;
        const submissionStats = parsedData.data.matchedUser.submitStats.acSubmissionNum;
        const totalSubmissions = parsedData.data.matchedUser.submitStats.totalSubmissionNum;

        const totalEasy = totalQuestions.find(q => q.difficulty === "Easy").count;
        const totalMedium = totalQuestions.find(q => q.difficulty === "Medium").count;
        const totalHard = totalQuestions.find(q => q.difficulty === "Hard").count;

        const solvedEasy = submissionStats.find(s => s.difficulty === "Easy").count;
        const solvedMedium = submissionStats.find(s => s.difficulty === "Medium").count;
        const solvedHard = submissionStats.find(s => s.difficulty === "Hard").count;

        updateProgress(solvedEasy, totalEasy, easyLabel, easyProgressCircle);
        updateProgress(solvedMedium, totalMedium, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHard, totalHard, hardLabel, hardProgressCircle);

        const cardData = [
            { label: "Overall Submission", value: totalSubmissions.find(d => d.difficulty === "All").submission },
            { label: "Easy Submissions", value: totalSubmissions.find(d => d.difficulty === "Easy").submission },
            { label: "Medium Submissions", value: totalSubmissions.find(d => d.difficulty === "Medium").submission },
            { label: "Hard Submissions", value: totalSubmissions.find(d => d.difficulty === "Hard").submission },
        ];

        console.log("Card data:", cardData);

        cardStatsContainer.innerHTML = cardData.map(
            data => {
                return `
                    <div class="card">
                        <h3>${data.label}</h3>
                        <p>${data.value}</p>
                    </div>
                `;
            }
        ).join("");
    }

    searchButton.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        console.log("Logging username:", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
