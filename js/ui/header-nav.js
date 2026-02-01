// =========================================================
// header.js
// مسؤول عن:
// - حركة الـ gooey effect تحت عناصر الـ nav
// - توليد الجسيمات (particles) عند الضغط
// =========================================================


// جلب كل عناصر القائمة داخل الـ nav
const navItems = document.querySelectorAll('nav ul li');

// العنصر المسؤول عن الـ gooey effect
const effect = document.getElementById('gooeyEffect');

// index العنصر النشط حاليًا
let active = 0;

// ألوان الجسيمات (مأخوذة من CSS variables)
const colors = [
  'var(--color-1)',
  'var(--color-2)',
  'var(--color-3)',
  'var(--color-4)'
];

// =========================================================
// دالة مساعدة لإنتاج رقم عشوائي موجب أو سالب
// تُستخدم لتحديد اتجاه حركة الجسيمات
// =========================================================
function random(n) {
  return Math.random() * n - n / 2;
}

// =========================================================
// توليد الجسيمات عند الضغط على عنصر في القائمة
// =========================================================
function makeParticles() {
  const particleCount = 50; // عدد الجسيمات في كل ضغطة

  for (let i = 0; i < particleCount; i++) {
    // إنشاء عناصر الجسيم
    const particle = document.createElement('span');
    const point = document.createElement('span');

    particle.className = 'particle';
    point.className = 'point';

    // اختيار لون عشوائي من المتغيرات
    const color = colors[Math.floor(Math.random() * colors.length)];

    // تحديد قيم CSS variables الخاصة بالحركة
    particle.style.setProperty('--start-x', `${random(50)}px`);
    particle.style.setProperty('--start-y', `${random(50)}px`);
    particle.style.setProperty('--end-x', `${random(100)}px`);
    particle.style.setProperty('--end-y', `${random(100)}px`);
    particle.style.setProperty('--color', color);

    // زمن الأنيميشن (عشوائي لإحساس طبيعي)
    particle.style.setProperty(
      '--time',
      `${500 + Math.random() * 500}ms`
    );

    // تركيب النقطة داخل الجسيم
    particle.appendChild(point);

    // إضافة الجسيم داخل عنصر الـ effect
    effect.appendChild(particle);

    // إزالة الجسيم من الـ DOM بعد انتهاء الأنيميشن
    setTimeout(() => {
      effect.removeChild(particle);
    }, 50000);
  }
}

// =========================================================
// تحريك عنصر الـ gooey effect
// ليكون تحت العنصر النشط مباشرة
// =========================================================
function moveEffect(el) {
  // أبعاد ومكان العنصر
  const rect = el.getBoundingClientRect();

  // أبعاد ومكان الـ ul (الأب)
  const navRect = el.parentElement.getBoundingClientRect();

  // ضبط حجم ومكان الـ effect بالنسبة للأب
  effect.style.width = rect.width + 'px';
  effect.style.height = rect.height + 'px';
  effect.style.left = rect.left - navRect.left + 'px';
  effect.style.top = rect.top - navRect.top + 'px';
}

// =========================================================
// إضافة event click لكل عنصر في القائمة
// =========================================================
navItems.forEach((li, index) => {
  li.addEventListener('click', () => {

    // لو ضغطت على نفس العنصر النشط، مفيش حاجة تحصل
    if (index === active) return;

    // إزالة active من العنصر القديم
    navItems[active].classList.remove('active');

    // إضافة active للعنصر الجديد
    li.classList.add('active');

    // تحديث العنصر النشط
    active = index;

    // تحريك الـ gooey effect
    moveEffect(li);

    // تشغيل الجسيمات
    makeParticles();
  });
});

// =========================================================
// تعيين مكان الـ gooey effect على أول عنصر عند تحميل الصفحة
// =========================================================
moveEffect(navItems[0]);



