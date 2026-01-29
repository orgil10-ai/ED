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
