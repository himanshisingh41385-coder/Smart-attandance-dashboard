let subjects = JSON.parse(localStorage.getItem('attendance')) || [];

const subjectNameInput = document.getElementById('subjectName');
const totalClassInput = document.getElementById('totalClass');
const attendedClassInput = document.getElementById('attendedClass');
const addBtn = document.getElementById('addBtn');
const statsGrid = document.getElementById('statsGrid');
const alertBox = document.getElementById('alertBox');
const exportBtn = document.getElementById('exportBtn');

let pieChart, barChart;

function calculateStats(total, attended) {
    const percent = (attended / total * 100).toFixed(1);
    const needed = Math.ceil(0.75 * total - attended);
    const canBunk = Math.floor(attended / 0.75 - total);
    return { percent, needed, canBunk };
}

function render() {
    statsGrid.innerHTML = '';
    let alertMsg = '';

    subjects.forEach((sub, i) => {
        const { percent, needed, canBunk } = calculateStats(sub.total, sub.attended);
        const isSafe = percent >= 75;

        if (!isSafe && needed > 0) {
            alertMsg += `${sub.name}: ${needed} more classes needed! `;
        }

        statsGrid.innerHTML += `
            <div class="card ${isSafe? 'safe' : 'danger'}">
                <h3>${sub.name}</h3>
                <div class="percent">${percent}%</div>
                <p>${sub.attended} / ${sub.total} classes</p>
                <div class="bunk-info">
                    ${isSafe? `You can bunk ${canBunk} more classes` : `Attend ${needed} more classes`}
                </div>
                <button onclick="deleteSub(${i})">Delete</button>
            </div>
        `;
    });

    alertBox.style.display = alertMsg? 'block' : 'none';
    alertBox.innerText = alertMsg;
    localStorage.setItem('attendance', JSON.stringify(subjects));
    updateCharts();
}

function updateCharts() {
    const labels = subjects.map(s => s.name);
    const data = subjects.map(s => s.attended);
    const percentages = subjects.map(s => (s.attended / s.total * 100).toFixed(1));

    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    if (subjects.length === 0) return;

    pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#6c5ce7','#a29bfe','#fd79a8']
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: 'white' } },
                title: { display: true, text: 'Classes Attended', color: 'white' }
            }
        }
    });

    barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Attendance %',
                data: percentages,
                backgroundColor: '#4ecdc4'
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { color: 'white' } },
                x: { ticks: { color: 'white' } }
            },
            plugins: {
                legend: { labels: { color: 'white' } },
                title: { display: true, text: 'Subject-wise %', color: 'white' }
            }
        }
    });
}

function deleteSub(i) {
    subjects.splice(i, 1);
    render();
}
// Make deleteSub global so onclick works
window.deleteSub = deleteSub;

addBtn.onclick = () => {
    const name = subjectNameInput.value.trim();
    const total = parseInt(totalClassInput.value);
    const attended = parseInt(attendedClassInput.value);

    if (name && total > 0 && attended >= 0 && attended <= total) {
        subjects.push({ name, total, attended });
        subjectNameInput.value = '';
        totalClassInput.value = '';
        attendedClassInput.value = '';
        render();
    } else {
        alert('Invalid input! Check: Name filled, Total > 0, Attended <= Total');
    }
};

exportBtn.onclick = () => {
    const dataStr = JSON.stringify(subjects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance-data.json';
    a.click();
    URL.revokeObjectURL(url);
};

// Initial render
render();
