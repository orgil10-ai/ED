import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDqEaWLW-Pl6WRhgw22ifp0pi-Zkrqfwq4",
    authDomain: "erdmiin-dalai-library.firebaseapp.com",
    databaseURL: "https://erdmiin-dalai-library-default-rtdb.firebaseio.com",
    projectId: "erdmiin-dalai-library",
    storageBucket: "erdmiin-dalai-library.firebasestorage.app",
    messagingSenderId: "223189730146",
    appId: "1:223189730146:web:e22672ce71d259d5f7a23b"
};

// --- 2. GROQ API KEY ---
const GROQ_API_KEY = "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";

let db;
let seatsData = {};

try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("Firebase Connected");
} catch(e) {
    console.error("Firebase Config Error:", e);
}

// --- GLOBAL FUNCTIONS ---
window.showLanding = function() {
    document.getElementById('landing').style.display = 'flex';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

window.switchTab = function(id) {
    document.getElementById('landing').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const activeSection = document.getElementById(id);
    if(activeSection) activeSection.classList.add('active');
    
    if(id === 'library') {
        initLibrary(); 
    }
}

window.filterSchedule = function() {
    var input = document.getElementById("searchTeacher").value.toUpperCase();
    var day = document.getElementById("dayFilter").value.toUpperCase();
    var cls = document.getElementById("classFilter").value.toUpperCase(); // Ангиар шүүх хувьсагч нэмсэн

    var tr = document.getElementById("teacherTable").getElementsByTagName("tr");
    
    for (var i = 1; i < tr.length; i++) {
        var tdName = tr[i].getElementsByTagName("td")[0];  // Багшийн нэр
        var tdDay = tr[i].getElementsByTagName("td")[3];   // Өдөр
        var tdClass = tr[i].getElementsByTagName("td")[5]; // Кабинет буюу Анги

        if (tdName && tdDay && tdClass) {
            var txtName = tdName.textContent || tdName.innerText;
            var txtDay = tdDay.textContent || tdDay.innerText;
            var txtClass = tdClass.textContent || tdClass.innerText;

            // Гурвуулангаар нь давхар шалгах
            var matchName = txtName.toUpperCase().indexOf(input) > -1;
            var matchDay = day === "" || txtDay.toUpperCase().indexOf(day) > -1;
            var matchClass = cls === "" || txtClass.toUpperCase().indexOf(cls) > -1;

            if (matchName && matchDay && matchClass) { 
                tr[i].style.display = ""; 
            } else { 
                tr[i].style.display = "none"; 
            }
        }
    }
}

window.handleKeyPress = function(e) { 
    if(e.key === 'Enter') sendMessage(); 
}

// --- 3. AI CHAT ---
window.sendMessage = async function() {
    var input = document.getElementById("chatInput"); 
    var msg = input.value.trim(); 
    if(msg==="") return;
    
    var hist = document.getElementById("chatHistory");
    hist.innerHTML += `<div class="chat-message user-msg">${msg}</div>`; 
    input.value = "";
    
    var loading = document.createElement("div"); 
    loading.className = "chat-message bot-msg"; 
    loading.innerHTML = "<i>Бодож байна...</i>"; 
    hist.appendChild(loading);
    hist.scrollTop = hist.scrollHeight;
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", 
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + GROQ_API_KEY
            },
            body: JSON.stringify({ 
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: "Чи бол 'Эрдмийн Далай' сургуулийн хиймэл оюун ухаант туслах. Монголоор товч, ойлгомжтой, найрсаг хариул." },
                    { role: "user", content: msg }
                ]
            })
        });

        const data = await response.json();
        hist.removeChild(loading);

        if (data.error) {
            console.error("Groq Error:", data.error);
            hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Алдаа: ${data.error.message}</div>`;
        } else {
            const botReply = data.choices[0].message.content;
            hist.innerHTML += `<div class="chat-message bot-msg">${botReply}</div>`;
        }

    } catch(e) { 
        hist.removeChild(loading); 
        console.error("Network Error:", e);
        hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Сүлжээний алдаа.</div>`; 
    }
    hist.scrollTop = hist.scrollHeight;
}

// --- 4. НОМ ЗАХИАЛГА ---
const books = [
    { title: "Монголын Нууц Товчоо", author: "Ц.Дамдинсүрэн" },
    { title: "Гарри Поттер", author: "Ж.К.Роулинг" },
    { title: "Ногоон нүдэн лам", author: "Ц.Оюунгэрэл" },
    { title: "Математик X", author: "Сурах бичиг" },
    { title: "Физик XI", author: "Сурах бичиг" }
];

function renderBooks(list) {
    const container = document.getElementById('bookList'); 
    container.innerHTML = "";
    list.forEach(b => {
        container.innerHTML += `
        <div class="book-card">
            <div class="book-cover">📖</div>
            <div class="book-info">
                <div class="book-title">${b.title}</div>
                <div class="book-author">${b.author}</div>
                <button class="order-btn" onclick="alert('Захиалга бүртгэгдлээ!')">Захиалах</button>
            </div>
        </div>`;
    });
}

window.searchBooks = function() {
    const val = document.getElementById('searchBookInput').value.toUpperCase();
    renderBooks(books.filter(b => b.title.toUpperCase().includes(val)));
}

window.toggleLessonForm = function() { var f=document.getElementById('addLessonForm'); f.style.display = f.style.display==='none'?'block':'none'; }
window.addTeleLesson = function() { 
    // 1. Формоос мэдээллүүдийг уншиж авах
    var subject = document.getElementById('elSubject').value.trim();
    var topic = document.getElementById('elTopic').value.trim();
    var teacher = document.getElementById('elTeacher').value.trim();
    var image = document.getElementById('elImage').value.trim();
    var link = document.getElementById('elLink').value.trim();

    // 2. Дутуу мэдээлэлтэй эсэхийг шалгах
    if(!subject || !topic || !link) {
        alert("Хичээлийн нэр, Сэдэв, Линк гурвыг заавал оруулна уу!");
        return;
    }

    // 3. Хэрвээ зурагны линк хийгээгүй бол автоматаар гоё дэвсгэр зураг тавих
    if(!image) {
        image = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop"; 
    }

    // 4. Шинэ карт үүсгэж дэлгэцэнд (lessonGrid) нэмэх
    var grid = document.getElementById('lessonGrid');
    var newLessonHTML = `
        <div class="lesson-card" style="border:1px solid #eee; border-radius:15px; overflow:hidden; background:white; box-shadow:0 4px 10px rgba(0,0,0,0.05); animation: fadeIn 0.5s;">
            <div class="lesson-thumb" style="height:150px; background-image: url('${image}'); background-size:cover; background-position:center;"></div>
            <div class="lesson-content" style="padding:15px; display:flex; flex-direction:column; gap:5px;">
                <div class="lesson-subject" style="font-size:12px; color:#e67e22; font-weight:bold;">${subject}</div>
                <div class="lesson-title" style="font-size:16px; font-weight:bold; color:#004aad;">${topic}</div>
                <div class="lesson-teacher" style="font-size:13px; color:#777; margin-bottom:10px;">Багш: ${teacher}</div>
                <a href="${link}" target="_blank" class="lesson-btn" style="background:#004aad; color:white; text-align:center; padding:8px; border-radius:8px; text-decoration:none; font-weight:bold;">ҮЗЭХ</a>
            </div>
        </div>
    `;
    
    // Хамгийн эхэнд шинэ хичээлийг нэмэх
    grid.insertAdjacentHTML('afterbegin', newLessonHTML);

    // 5. Оруулсны дараа формыг хоослоод, буцааж хаах
    document.getElementById('elSubject').value = "";
    document.getElementById('elTopic').value = "";
    document.getElementById('elTeacher').value = "";
    document.getElementById('elImage').value = "";
    document.getElementById('elLink').value = "";
    
    document.getElementById('addLessonForm').style.display = 'none'; 
    alert("Хичээл амжилттай нийтлэгдлээ!"); 
}
window.addNewLesson = function() { if(document.getElementById('adminPass').value==='1234') alert("Хуваарь шинэчлэгдлээ!"); else alert("Нууц үг буруу"); }

// --- 5. LIBRARY LOGIC ---
function initLibrary() {
    const center = document.getElementById('center-tables');
    
    if(center.querySelectorAll('.double-table').length === 0) {
        center.innerHTML = ""; 
        for(let i=1; i<=20; i++) {
            center.innerHTML += `<div class="double-table"><div class="seat table" id="C${i}A">${i}A</div><div class="table-divider"></div><div class="seat table" id="C${i}B">${i}B</div></div>`;
        }
    }

    if(db) {
        const seatsRef = ref(db, 'seats');
        onValue(seatsRef, (snapshot) => {
            seatsData = snapshot.val() || {};
            document.querySelectorAll('.seat').forEach(s => s.classList.remove('occupied'));
            
            Object.keys(seatsData).forEach(key => {
                const el = document.getElementById(key);
                if(seatsData[key].endTime < Date.now()) {
                    remove(ref(db, 'seats/' + key)); 
                } else if(el && seatsData[key].status === 'occupied') {
                    el.classList.add('occupied');
                }
            });
        });
    }

    const library = document.getElementById('library');
    const newLibrary = library.cloneNode(true); 
    library.parentNode.replaceChild(newLibrary, library);
    
    newLibrary.addEventListener('click', e => {
        if(e.target.classList.contains('seat')) {
            const seat = e.target;
            
            if(seat.classList.contains('occupied')) {
                const data = seatsData[seat.id];
                if(data) {
                    const endDate = new Date(data.endTime);
                    const timeStr = endDate.getHours() + ":" + String(endDate.getMinutes()).padStart(2, '0');
                    
                    // ШИНЭЭР НЭМСЭН: Нэр болон Ангийг харуулах хэсэг
                    const userName = data.userName ? `НЭР: ${data.userName}\n` : '';
                    const className = data.className ? `АНГИ: ${data.className}\n` : '';
                    
                    const pinInput = prompt(`${userName}${className}Энэ суудал ${timeStr}-д дуусна.\n\nЦуцлахын тулд ПИН кодоо хийнэ үү:`);
                    
                    if(String(pinInput) === String(data.pin)) {
                        remove(ref(db, 'seats/' + seat.id));
                        alert("Захиалга цуцлагдлаа!");
                    } else if(pinInput !== null) {
                        alert("ПИН код буруу байна!");
                    }
                }
                return;
            }
            e.target.classList.toggle('selected');
        }
        
        if(e.target.id === 'bookBtn') handleBooking();
        if(e.target.classList.contains('back-btn')) window.showLanding();
    });
}

function handleBooking() {
    const selected = document.querySelectorAll('.seat.selected');
    const userName = document.getElementById('userName').value.trim(); // ШИНЭЭР НЭМСЭН: Нэр авах
    const userClass = document.getElementById('userClass').value.trim();
    const pin = document.getElementById('bookingPin').value;
    const hours = parseInt(document.getElementById('bookingHours').value) || 0;
    const minutes = parseInt(document.getElementById('bookingMinutes').value) || 0;

    if(selected.length === 0) { alert("Суудал сонгоно уу!"); return; }
    if(!userName) { alert("Нэрээ оруулна уу!"); return; } // ШИНЭЭР НЭМСЭН: Нэр шалгах
    if(!userClass) { alert("Ангийн нэрээ оруулна уу!"); return; }
    if(pin.length !== 4) { alert("4 оронтой ПИН хийнэ үү!"); return; }
    if(hours === 0 && minutes === 0) { alert("Хугацаагаа сонгоно уу!"); return; }

    const durationMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    const endTime = Date.now() + durationMs;

    selected.forEach(s => {
        if(db) {
            set(ref(db, 'seats/' + s.id), {
                status: 'occupied',
                pin: pin,
                userName: userName, // ШИНЭЭР НЭМСЭН: Database-д нэрийг хадгалах
                className: userClass,
                endTime: endTime
            });
        }
    });
    document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
    alert("Амжилттай захиалагдлаа!");
}

document.addEventListener('DOMContentLoaded', () => {
    renderBooks(books);
});
