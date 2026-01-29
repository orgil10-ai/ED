// ==========================================
// 1. ЦЭС ХООРОНД ШИЛЖИХ ЛОГИК (Tab Switching)
// ==========================================
function showSection(sectionId) {
    // Бүх хэсгүүдийн ID-г жагсаалтаар авна
    const sections = ['teachers', 'rooms', 'library'];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Хэрэв ID таарвал харуулна, үгүй бол нууна
            element.style.display = (id === sectionId) ? 'block' : 'none';
        }
    });
}

// ==========================================
// 2. БАГШИЙН ХУВААРЬ ХАЙХ ЛОГИК
// ==========================================
// Санамж: HTML дээрх input-ийн ID нь "searchTeacher" байх ёстой
const searchInput = document.getElementById("searchTeacher");

if (searchInput) {
    searchInput.addEventListener("keyup", function() {
        let filter = searchInput.value.toUpperCase();
        let table = document.getElementById("teacherTable");
        let tr = table.getElementsByTagName("tr");

        for (let i = 1; i < tr.length; i++) { // i=1 гээд хүснэгтийн толгойг алгасна
            let td = tr[i].getElementsByTagName("td")[0]; // Багшийн нэр 1-р багана
            if (td) {
                let txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    });
}

// ==========================================
// 3. НОМЫН САНГИЙН СУУДАЛ ЗАХИАЛАХ ЛОГИК
// ==========================================
const container = document.querySelector('.library-container'); // .container-оос илүү тодорхой болгов
const bookBtn = document.getElementById('bookBtn');
const count = document.getElementById('count');

if (container) {
    // Суудал дээр дарах үед (Event Delegation)
    container.addEventListener('click', (e) => {
        // Зөвхөн сул (available) суудал дээр дарахад ажиллана
        if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
            e.target.classList.toggle('selected');
            updateCount();
        }
    });
}

// Сонгосон суудлын тоог шинэчлэх функц
function updateCount() {
    if (count) {
        const selectedSeats = document.querySelectorAll('.seat.selected');
        count.innerText = selectedSeats.length;
    }
}

// Захиалах товч дарах үед
if (bookBtn) {
    bookBtn.addEventListener('click', () => {
        const selectedSeats = document.querySelectorAll('.seat.selected');
        
        if (selectedSeats.length > 0) {
            let seatNames = [];
            selectedSeats.forEach(seat => seatNames.push(seat.innerText));
            
            // Баталгаажуулах мессеж
            alert(`Амжилттай! Та [${seatNames.join(", ")}] суудлуудыг захиаллаа.`);
            
            // Сонгосон суудлуудыг 'Эзэнтэй' болгож өнгийг нь солих
            selectedSeats.forEach(seat => {
                seat.classList.remove('selected');
                seat.classList.add('occupied');
            });
            
            updateCount(); // Тоолуурыг 0 болгоно
        } else {
            alert("Та суудал сонгоогүй байна! Сул суудлуудаас сонгоно уу.");
        }
    });
}
