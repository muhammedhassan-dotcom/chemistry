/**
 * ============================================
 * COURSE CAROUSEL COMPONENT
 * ============================================
 * Interactive 3D carousel for course cards
 * with modal lessons viewer
 */

class CourseCarousel {
  constructor() {
    this.container = document.querySelector('.cards-container');
    this.cards = Array.from(document.querySelectorAll('.course-card'));
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    this.dots = Array.from(document.querySelectorAll('.dot'));
    this.modal = document.getElementById('lessonsModal');
    this.modalBody = document.querySelector('.modal-body');
    
    this.currentIndex = 0;
    this.totalCards = this.cards.length;
    this.isAnimating = false;
    this.autoRotateInterval = null;
    this.currentCourseId = null;
    
    this.init();
  }
  
  /**
   * Initialize the carousel
   */
  init() {
    this.setupCards();
    this.setupEventListeners();
    this.startAutoRotate();
    this.updateNavigation();
    this.updateDots();
  }
  
  /**
   * Setup initial card positions and progress rings
   */
  setupCards() {
    this.cards.forEach((card, index) => {
      const progress = card.querySelector('.progress-circle').dataset.progress;
      this.updateProgressRing(card, progress);
      
      // Set initial card classes based on position
      this.updateCardClasses(card, index);
    });
  }
  
  /**
   * Update progress ring SVG
   */
  updateProgressRing(card, progress) {
    const circle = card.querySelector('.progress-ring-fill');
    if (!circle) return;
    
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  }
  
  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevBtn?.addEventListener('click', () => this.prevCard());
    this.nextBtn?.addEventListener('click', () => this.nextCard());
    
    // Dots navigation
    this.dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToCard(index);
      });
    });
    
    // Card interactions
    this.cards.forEach(card => {
      this.setupCardEvents(card);
    });
    
    // Modal events
    this.setupModalEvents();
    
    // Drag/Swipe interactions
    this.setupDragEvents();
  }
  
  /**
   * Setup individual card events
   */
  setupCardEvents(card) {
    // View details button
    const viewBtn = card.querySelector('.view-details-btn');
    viewBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = card.dataset.courseId;
      this.showLessonsModal(courseId);
    });
    
    // Enter course button
    const enterBtn = card.querySelector('.enter-course-btn');
    enterBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const courseId = card.dataset.courseId;
      this.enterCourse(courseId);
    });
    
    // Card click (navigate to card)
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        const index = parseInt(card.dataset.index);
        if (index !== this.currentIndex) {
          this.goToCard(index);
        }
      }
    });
  }
  
  /**
   * Setup modal events
   */
  setupModalEvents() {
    // Close buttons
    const closeBtns = this.modal?.querySelectorAll('.modal-close, #closeModalBtn');
    closeBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
    
    // Start lesson button
    const startBtn = this.modal?.querySelector('#startLessonBtn');
    startBtn?.addEventListener('click', () => {
      this.startCurrentLesson();
    });
    
    // Overlay click
    this.modal?.querySelector('.modal-overlay')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
  
  /**
   * Setup drag and swipe events
   */
  setupDragEvents() {
    let startX = 0;
    let isDragging = false;
    
    const handleStart = (clientX) => {
      startX = clientX;
      isDragging = true;
      this.stopAutoRotate();
    };
    
    const handleMove = (clientX) => {
      if (!isDragging) return;
      
      const diff = clientX - startX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.prevCard();
        } else {
          this.nextCard();
        }
        isDragging = false;
      }
    };
    
    // Mouse events
    this.container?.addEventListener('mousedown', (e) => handleStart(e.clientX));
    document.addEventListener('mousemove', (e) => handleMove(e.clientX));
    document.addEventListener('mouseup', () => {
      isDragging = false;
      this.startAutoRotate();
    });
    
    // Touch events
    this.container?.addEventListener('touchstart', (e) => {
      handleStart(e.touches[0].clientX);
    });
    document.addEventListener('touchmove', (e) => {
      handleMove(e.touches[0].clientX);
    });
    document.addEventListener('touchend', () => {
      isDragging = false;
      this.startAutoRotate();
    });
  }
  
  /**
   * Navigate to previous card
   */
  prevCard() {
    if (this.isAnimating) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
    this.updateCards();
    this.updateNavigation();
    this.updateDots();
  }
  
  /**
   * Navigate to next card
   */
  nextCard() {
    if (this.isAnimating) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.totalCards;
    this.updateCards();
    this.updateNavigation();
    this.updateDots();
  }
  
  /**
   * Navigate to specific card
   */
  goToCard(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.currentIndex = index;
    this.updateCards();
    this.updateNavigation();
    this.updateDots();
  }
  
  /**
   * Update all card positions and classes
   */
  updateCards() {
    this.isAnimating = true;
    
    this.cards.forEach((card, index) => {
      // Remove all position classes
      card.classList.remove('active', 'prev-1', 'prev-2', 'next-1', 'next-2');
      
      // Calculate position difference
      let diff = index - this.currentIndex;
      
      // Handle wrapping
      if (diff < -2) diff += this.totalCards;
      if (diff > 2) diff -= this.totalCards;
      
      // Add appropriate class
      this.updateCardClasses(card, index, diff);
    });
    
    // Reset animation lock
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }
  
  /**
   * Update individual card class based on position
   */
  updateCardClasses(card, index, diff = null) {
    if (diff === null) {
      diff = index - this.currentIndex;
      if (diff < -2) diff += this.totalCards;
      if (diff > 2) diff -= this.totalCards;
    }
    
    const classMap = {
      0: 'active',
      [-1]: 'prev-1',
      [-2]: 'prev-2',
      1: 'next-1',
      2: 'next-2'
    };
    
    const className = classMap[diff];
    if (className) {
      card.classList.add(className);
    }
  }
  
  /**
   * Update navigation buttons state
   */
  updateNavigation() {
    if (this.prevBtn) this.prevBtn.disabled = this.isAnimating;
    if (this.nextBtn) this.nextBtn.disabled = this.isAnimating;
  }
  
  /**
   * Update dots indicators
   */
  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
  
  /**
   * Show lessons modal
   */
  showLessonsModal(courseId) {
    this.currentCourseId = courseId;
    const lessonsData = this.getLessonsData(courseId);
    
    this.modalBody.innerHTML = this.buildLessonsHTML(lessonsData);
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    this.setupLessonEvents();
  }
  
  /**
   * Get lessons data (mock data - replace with API call)
   */
  getLessonsData(courseId) {
    const courses = {
      '1': {
        title: 'أساسيات الفيزياء',
        lessons: [
          { id: 1, title: 'مقدمة في الفيزياء', duration: '15 دقيقة', status: 'completed' },
          { id: 2, title: 'القياس والوحدات', duration: '20 دقيقة', status: 'completed' },
          { id: 3, title: 'الكيمات الفيزيائية', duration: '25 دقيقة', status: 'current' },
          { id: 4, title: 'التحليل البعدي', duration: '30 دقيقة', status: 'pending' },
          { id: 5, title: 'الاختبار التقييمي', duration: '15 دقيقة', status: 'pending' }
        ]
      },
      '2': {
        title: 'الحركة الخطية',
        lessons: [
          { id: 1, title: 'مقدمة في الحركة', duration: '20 دقيقة', status: 'completed' },
          { id: 2, title: 'السرعة المتوسطة', duration: '25 دقيقة', status: 'completed' },
          { id: 3, title: 'السرعة اللحظية', duration: '30 دقيقة', status: 'current' },
          { id: 4, title: 'التسارع', duration: '35 دقيقة', status: 'pending' },
          { id: 5, title: 'حركة المقذوفات', duration: '40 دقيقة', status: 'pending' }
        ]
      },
      '3': {
        title: 'القوى والحركة',
        lessons: [
          { id: 1, title: 'مقدمة في الديناميكا', duration: '20 دقيقة', status: 'pending' },
          { id: 2, title: 'قانون نيوتن الأول', duration: '25 دقيقة', status: 'pending' },
          { id: 3, title: 'قانون نيوتن الثاني', duration: '30 دقيقة', status: 'pending' },
          { id: 4, title: 'قانون نيوتن الثالث', duration: '25 دقيقة', status: 'pending' },
          { id: 5, title: 'تطبيقات عملية', duration: '35 دقيقة', status: 'pending' }
        ]
      },
      '4': {
        title: 'الكهرباء والمغناطيسية',
        lessons: [
          { id: 1, title: 'الشحنة الكهربائية', duration: '20 دقيقة', status: 'completed' },
          { id: 2, title: 'المجال الكهربائي', duration: '25 دقيقة', status: 'completed' },
          { id: 3, title: 'قانون أوم', duration: '30 دقيقة', status: 'current' },
          { id: 4, title: 'الدوائر الكهربائية', duration: '35 دقيقة', status: 'pending' },
          { id: 5, title: 'المغناطيسية', duration: '40 دقيقة', status: 'pending' }
        ]
      },
      '5': {
        title: 'الفيزياء الحديثة',
        lessons: [
          { id: 1, title: 'النظرية النسبية', duration: '30 دقيقة', status: 'completed' },
          { id: 2, title: 'الموجات والجسيمات', duration: '35 دقيقة', status: 'completed' },
          { id: 3, title: 'مبدأ عدم اليقين', duration: '25 دقيقة', status: 'current' },
          { id: 4, title: 'معادلة شرودنغر', duration: '40 دقيقة', status: 'pending' },
          { id: 5, title: 'التطبيقات الحديثة', duration: '45 دقيقة', status: 'pending' }
        ]
      }
    };
    
    return courses[courseId] || courses['1'];
  }
  
  /**
   * Build lessons HTML
   */
  buildLessonsHTML(data) {
    return `
      <div class="course-info">
        <h4 class="course-name">${data.title}</h4>
        <p class="total-lessons">${data.lessons.length} درس</p>
      </div>
      
      <div class="lessons-container">
        ${data.lessons.map((lesson, index) => `
          <div class="lesson-card ${lesson.status}" data-lesson-id="${lesson.id}">
            <div class="lesson-number">${index + 1}</div>
            <div class="lesson-content">
              <h5 class="lesson-title">${lesson.title}</h5>
              <div class="lesson-meta">
                <span class="lesson-duration">${lesson.duration}</span>
                <span class="lesson-status-badge ${lesson.status}">
                  ${this.getStatusText(lesson.status)}
                </span>
              </div>
            </div>
            <button class="lesson-play-btn" data-lesson-id="${lesson.id}" aria-label="تشغيل الدرس">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Get status text in Arabic
   */
  getStatusText(status) {
    const statusMap = {
      'completed': 'مكتمل',
      'current': 'جاري',
      'pending': 'لم يبدأ'
    };
    return statusMap[status] || 'لم يبدأ';
  }
  
  /**
   * Setup lesson card events
   */
  setupLessonEvents() {
    // Play buttons
    this.modalBody.querySelectorAll('.lesson-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lessonId = btn.dataset.lessonId;
        this.startLesson(this.currentCourseId, lessonId);
      });
    });
    
    // Card clicks
    this.modalBody.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        const lessonId = card.dataset.lessonId;
        this.startLesson(this.currentCourseId, lessonId);
      });
    });
  }
  
  /**
   * Start a specific lesson
   */
  startLesson(courseId, lessonId) {
    console.log(`Starting lesson ${lessonId} in course ${courseId}`);
    this.showNotification(`جاري تحميل الدرس...`);
    this.closeModal();
    
    // TODO: Navigate to lesson page
    // window.location.href = `/course/${courseId}/lesson/${lessonId}`;
  }
  
  /**
   * Start current lesson
   */
  startCurrentLesson() {
    if (this.currentCourseId) {
      this.startLesson(this.currentCourseId, 'current');
    }
  }
  
  /**
   * Enter course
   */
  enterCourse(courseId) {
    console.log(`Entering course ${courseId}`);
    this.showNotification(`جاري تحميل الكورس...`);
    
    // TODO: Navigate to course page
    // window.location.href = `/course/${courseId}`;
  }
  
  /**
   * Close modal
   */
  closeModal() {
    this.modal?.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<div class="notification-content"><span>${message}</span></div>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  /**
   * Start auto rotation
   */
  startAutoRotate() {
    this.stopAutoRotate();
    this.autoRotateInterval = setInterval(() => {
      this.nextCard();
    }, 5000);
  }
  
  /**
   * Stop auto rotation
   */
  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize only if section exists
  if (document.querySelector('.courses-showcase')) {
    window.courseCarousel = new CourseCarousel();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CourseCarousel;
}