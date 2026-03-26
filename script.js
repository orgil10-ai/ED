import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqEaWLW-Pl6WRhgw22ifp0pi-Zkrqfwq4",
    authDomain: "erdmiin-dalai-library.firebaseapp.com",
    databaseURL: "https://erdmiin-dalai-library-default-rtdb.firebaseio.com",
    projectId: "erdmiin-dalai-library",
    storageBucket: "erdmiin-dalai-library.firebasestorage.app",
    messagingSenderId: "223189730146",
    appId: "1:223189730146:web:e22672ce71d259d5f7a23b"
};

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
    if(id === 'library') initLibrary(); 
}

window.filterSchedule = function() {
    var input = document.getElementById("searchTeacher").value.toUpperCase();
    var day = document.getElementById("dayFilter").value.toUpperCase();
    var cls = document.getElementById("classFilter").value.toUpperCase(); 

    var tr = document.getElementById("teacherTable").getElementsByTagName("tr");
    for (var i = 1; i < tr.length; i++) {
        var tdName = tr[i].getElementsByTagName("td")[0];  
        var tdDay = tr[i].getElementsByTagName("td")[3];   
        var tdClass = tr[i].getElementsByTagName("td")[5]; 

        if (tdName && tdDay && tdClass) {
            var txtName = tdName.textContent || tdName.innerText;
            var txtDay = tdDay.textContent || tdDay.innerText;
            var txtClass = tdClass.textContent || tdClass.innerText;

            var matchName = txtName.toUpperCase().indexOf(input) > -1;
            var matchDay = day === "" || txtDay.toUpperCase().indexOf(day) > -1;
            var matchClass = cls === "" || txtClass.toUpperCase().indexOf(cls) > -1;

            if (matchName && matchDay && matchClass) { tr[i].style.display = ""; } 
            else { tr[i].style.display = "none"; }
        }
    }
}

window.handleKeyPress = function(e) { if(e.key === 'Enter') sendMessage(); }

// --- AI CHAT ---
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
        if (data.error) { hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Алдаа: ${data.error.message}</div>`; } 
        else { hist.innerHTML += `<div class="chat-message bot-msg">${data.choices[0].message.content}</div>`; }
    } catch(e) { 
        hist.removeChild(loading); 
        hist.innerHTML += `<div class="chat-message bot-msg" style="color:red;">Сүлжээний алдаа.</div>`; 
    }
    hist.scrollTop = hist.scrollHeight;
}

// --- НОМ ЗАХИАЛГА ---
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
        <div class="book-card"><div class="book-cover">📖</div><div class="book-info">
        <div class="book-title">${b.title}</div><div class="book-author">${b.author}</div>
        <button class="order-btn" onclick="alert('Захиалга бүртгэгдлээ!')">Захиалах</button></div></div>`;
    });
}
window.searchBooks = function() {
    const val = document.getElementById('searchBookInput').value.toUpperCase();
    renderBooks(books.filter(b => b.title.toUpperCase().includes(val)));
}

// --- ЦАХИМ ХИЧЭЭЛ ---
window.toggleLessonForm = function() { var f=document.getElementById('addLessonForm'); f.style.display = f.style.display==='none'?'block':'none'; }
window.addNewLesson = function() { if(document.getElementById('adminPass').value==='1234') alert("Хуваарь шинэчлэгдлээ!"); else alert("Нууц үг буруу"); }

window.addTeleLesson = function() { 
    var subject = document.getElementById('elSubject').value.trim();
    var topic = document.getElementById('elTopic').value.trim();
    var teacher = document.getElementById('elTeacher').value.trim();
    var image = document.getElementById('elImage').value.trim();
    var link = document.getElementById('elLink').value.trim();

    if(!subject || !topic || !link) { alert("Хичээлийн нэр, Сэдэв, Линк гурвыг заавал оруулна уу!"); return; }
    if(!image) { image = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop"; }

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
        </div>`;
    grid.insertAdjacentHTML('afterbegin', newLessonHTML);
    
    ['elSubject','elTopic','elTeacher','elImage','elLink'].forEach(id => document.getElementById(id).value = "");
    document.getElementById('addLessonForm').style.display = 'none'; 
    alert("Хичээл амжилттай нийтлэгдлээ!"); 
}

// --- 5. LIBRARY LOGIC (СУУДАЛ ЗАХИАЛГА) ---
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
                if(seatsData[key].endTimestamp && seatsData[key].endTimestamp <= Date.now()) {
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
                    const uName = data.userName ? data.userName : "Тодорхойгүй";
                    const uClass = data.className ? data.className : "";
                    const bDate = data.bookingDate ? data.bookingDate : "Өнөөдөр";
                    const sTime = data.startTime ? data.startTime : "??:??";
                    const eTime = data.endTime ? data.endTime : "??:??";
                    
                    const msg = `👤 НЭР: ${uName} (${uClass})\n📅 ӨДӨР: ${bDate}\n⏰ ЦАГ: ${sTime} - ${eTime}\n\nЦуцлахын тулд ПИН кодоо хийнэ үү:`;
                    const pinInput = prompt(msg);
                    
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
    const userName = document.getElementById('userName').value.trim(); 
    const userClass = document.getElementById('userClass').value.trim();
    const pin = document.getElementById('bookingPin').value;
    const bDate = document.getElementById('bookingDate').value;
    const sTime = document.getElementById('startTime').value;
    const eTime = document.getElementById('endTime').value;

    if(selected.length === 0) { alert("Суудал сонгоно уу!"); return; }
    if(!userName || !userClass) { alert("Нэр, ангиа оруулна уу!"); return; } 
    if(pin.length !== 4) { alert("4 оронтой ПИН хийнэ үү!"); return; }
    if(!bDate || !sTime || !eTime) { alert("Өдөр болон эхлэх, дуусах цагаа бүрэн сонгоно уу!"); return; }

    // Цагийг хэзээ ч алдаа заахгүйгээр аюулгүй салгаж авах нь:
    const [year, month, day] = bDate.split('-').map(Number);
    let sHour = parseInt(sTime.split(':')[0]);
    let sMin = parseInt(sTime.split(':')[1]);
    let eHour = parseInt(eTime.split(':')[0]);
    let eMin = parseInt(eTime.split(':')[1]);

    if(sTime === "24:00") { sHour = 23; sMin = 59; }
    if(eTime === "24:00") { eHour = 23; eMin = 59; }

    const startTimestamp = new Date(year, month - 1, day, sHour, sMin).getTime();
    const endTimestamp = new Date(year, month - 1, day, eHour, eMin).getTime();

    if (endTimestamp <= startTimestamp) {
        alert("Дуусах цаг эхлэх цагаас хойш байх ёстой!");
        return;
    }

    if (endTimestamp <= Date.now()) {
        alert("Өнгөрсөн цагт захиалга хийх боломжгүй! Ирээдүйн цаг эсвэл өөр өдөр сонгоно уу.");
        return;
    }

    if(db) {
        const updates = [];
        selected.forEach(s => {
            // Firebase-рүү илгээхийг баталгаажуулах хувьсагч (Promise)
            const request = set(ref(db, 'seats/' + s.id), {
                status: 'occupied',
                pin: pin,
                userName: userName, 
                className: userClass,
                bookingDate: bDate,
                startTime: sTime,
                endTime: eTime,
                endTimestamp: endTimestamp
            });
            updates.push(request);
        });

        // БҮХ мэдээлэл Firebase-д амжилттай орсны ДАРАА л амжилттай гэж хэлнэ
        Promise.all(updates)
        .then(() => {
            document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
            alert("Амжилттай захиалагдлаа!");
        })
        .catch((error) => {
            // Хэрвээ Firebase хүлээж авахгүй бол энд алдаа заана!
            alert("Алдаа гарлаа: Firebase-тай холбогдож чадсангүй. " + error.message);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderBooks(books);
});
