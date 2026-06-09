// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');

    // Page navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('open');
            }
            
            // Scroll to top of page
            window.scrollTo(0, 0);
        });
    });

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mainNav.classList.remove('open');
            }
        }
    });

    // Collapsible sections for research streams
    const collapsibles = document.querySelectorAll('.collapsible');
    
    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('active');
            
            const content = this.nextElementSibling;
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Abstract toggles for publications
    const abstractToggles = document.querySelectorAll('.abstract-toggle');
    
    abstractToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const abstractContent = this.nextElementSibling;
            
            if (abstractContent.style.maxHeight) {
                abstractContent.style.maxHeight = null;
                this.textContent = 'Abstract';
            } else {
                abstractContent.style.maxHeight = abstractContent.scrollHeight + "px";
                this.textContent = 'Hide Abstract';
            }
        });
    });

    // Timeline navigation for teaching page
    const timelineLinks = document.querySelectorAll('.timeline-link');
    
    timelineLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all timeline links
            timelineLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target year
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offset = 100; // Offset for sticky timeline
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active timeline link on scroll (for teaching page)
    let ticking = false;
    
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            updateActiveTimelineLink();
            updateActiveResearchLink();  // ADD THIS LINE
            ticking = false;
        });
        ticking = true;
    }
});
    
    function updateActiveTimelineLink() {
        // Only run if on teaching page
        const teachingSection = document.getElementById('teaching');
        if (!teachingSection || !teachingSection.classList.contains('active')) {
            return;
        }
        
        const teachingYears = document.querySelectorAll('.teaching-year');
        let currentYear = null;
        
        teachingYears.forEach(year => {
            const rect = year.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                currentYear = year.id;
            }
        });
        
        if (currentYear) {
            timelineLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentYear) {
                    link.classList.add('active');
                }
            });
        }
    }

function updateActiveResearchLink() {
    // Only run if on research page
    const researchSection = document.getElementById('research');
    if (!researchSection || !researchSection.classList.contains('active')) {
        return;
    }
    
    const researchTimelineLinks = document.querySelectorAll('#research .timeline-link');
    const scrollPosition = window.scrollY + 200; // Offset from top
    
    // Get all sections with their absolute positions
    const sections = [
        { id: 'research-streams', element: document.getElementById('research-streams') },
        { id: 'publications', element: document.getElementById('publications') },
        { id: 'manuscripts', element: document.getElementById('manuscripts') }
    ].filter(s => s.element !== null);
    
    // Find which section we're currently in
    let currentSection = sections[0].id; // Default to first section
    
    sections.forEach(section => {
        // Get absolute position from top of page
        const rect = section.element.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        
        if (scrollPosition >= absoluteTop) {
            currentSection = section.id;
        }
    });
    
    // Update active states
    researchTimelineLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

    // Smooth scrolling for anchor links within pages
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip if it's a nav link (already handled)
        if (anchor.classList.contains('nav-link') || anchor.classList.contains('timeline-link')) {
            return;
        }
        
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle anchors within the same page
            if (href.startsWith('#') && href.length > 1) {
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const offset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    
});