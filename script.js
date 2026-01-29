// 1. БАГШИЙН ХУВААРЬ ХАЙХ ЛОГИК
const searchInput = document.getElementById("searchTeacher");
if (searchInput) { // Зөвхөн index.html дээр ажиллана
    searchInput.addEventListener("keyup", function() {
        let filter = searchInput.value.toUpperCase();
        let table = document.getElementById("teacherTable");
        let tr = table.getElementsByTagName("tr");

        for (let i = 0; i < tr.length; i++) {
            let td = tr[i].getElementsByTagName("td")[0];
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

// 2. НОМЫН САНГИЙН СУУДАЛ ЗАХИАЛАХ ЛОГИК
const container = document.querySelector('.container');
const bookBtn = document.getElementById('bookBtn');
const count = document.getElementById('count');

if (container && bookBtn) { // Зөвхөн library.html дээр ажиллана
    // Суудал сонгох
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
            e.target.classList.toggle('selected');
            updateCount();
        }
    });

    // Тоог шинэчлэх
    function updateCount() {
        const selectedSeats = document.querySelectorAll('.row .seat.selected');
        count.innerText = selectedSeats.length;
    }

    // Захиалах товч
    bookBtn.addEventListener('click', () => {
        const selectedSeats = document.querySelectorAll('.row .seat.selected');
        if (selectedSeats.length > 0) {
            alert(`Амжилттай! Та ${selectedSeats.length} суудал захиаллаа.`);
            selectedSeats.forEach(seat => {
                seat.classList.remove('selected');
                seat.classList.add('occupied');
            });
            updateCount();
        } else {
            alert("Та суудал сонгоогүй байна!");
        }
    });
}
function filterTeachers() {
    // 1. Хайх талбарт бичсэн текстийг авах
    let input = document.getElementById('teacherSearch').value.toLowerCase();
    
    // 2. Хүснэгтийн бүх мөрүүдийг (row) олох
    let table = document.getElementById('teacherTable');
    let tr = table.getElementsByTagName('tr');

    // 3. Мөр бүрээр гүйж, нэрийг нь шалгах
    for (let i = 1; i < tr.length; i++) { // i=1 гэдэг нь гарчиг (header)-ыг алгасаж байна
        let td = tr[i].getElementsByTagName('td')[0]; // 0 гэдэг нь 'Багшийн нэр' багана
        
        if (td) {
            let txtValue = td.textContent || td.innerText;
            
            // Хэрэв хайсан үг нэр дотор байвал харуулна, байхгүй бол нууна
            if (txtValue.toLowerCase().indexOf(input) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
