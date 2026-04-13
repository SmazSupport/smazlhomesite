document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initResumeToggle();
    initPrintResume();
    initSmoothScroll();
    initNavbarScroll();
});

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 300);
    });
}

function initResumeToggle() {
    const toggleButton = document.getElementById('toggle-detail');
    const toggleText = document.getElementById('toggle-text');
    
    if (!toggleButton) return;
    
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('show-detailed');
        
        const isDetailed = document.body.classList.contains('show-detailed');
        toggleText.textContent = isDetailed ? 'Show Standard View' : 'Show Detailed View';
        
        toggleButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            toggleButton.style.transform = '';
        }, 150);
    });
}

function initPrintResume() {
    const printButton = document.getElementById('print-resume');
    
    if (!printButton) return;
    
    printButton.addEventListener('click', () => {
        const wasDetailed = document.body.classList.contains('show-detailed');
        
        if (wasDetailed) {
            document.body.classList.remove('show-detailed');
        }
        
        window.print();
        
        if (wasDetailed) {
            setTimeout(() => {
                document.body.classList.add('show-detailed');
            }, 100);
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

window.addEventListener('beforeprint', () => {
    const originalTitle = document.title;
    document.title = 'Mark Stevens - Resume';
    
    window.addEventListener('afterprint', () => {
        document.title = originalTitle;
    }, { once: true });
});
