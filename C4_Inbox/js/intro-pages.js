/**
 * INTRO PAGES SYSTEM
 * Shows introduction to fictional company before experiment
 */

class IntroPages {
    constructor(experiment) {
        this.experiment = experiment;
        this.currentPage = 0;
        this.pages = [
            {
                image: 'images/intro/Optimo Logo.jpg',
                text: 'Imagine you work as a software engineer for Optimo, which is a tech company specializing in digital supply chain solutions, offering cloud-based platforms that streamline logistics, visibility, and asset management.'
            },
            {
                image: 'images/intro/Office.jpg',
                text: 'This is your office. It\'s in a small town in the San Francisco Bay Area.'
            },
            {
                image: 'images/intro/Manager.jpg',
                text: 'You work in a team with 10 other software engineers. This is your manager, Sarah Chen.'
            },
            {
                image: 'images/intro/Team.jpg',
                text: 'These are some of your other teammates, Taylor Kim, Alex Martinez, Jordan Lee, and Sam Chen.'
            },
            {
                image: 'images/intro/HR2.jpg',
                text: 'And this is the head of human resources, Chris Schafer.'
            },
            {
                image: null,
                text: 'It\'s your first day back at work after the end-of-year holidays. Hope you\'re ready!'
            }
        ];
        
        this.container = null;
    }

    /**
     * Start showing intro pages
     */
    start() {
        // Hide main container
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }

        // Create intro container
        this.container = document.createElement('div');
        this.container.id = 'intro-container';
        this.container.style.cssText = `
            max-width: 900px;
            margin: 50px auto;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        document.body.appendChild(this.container);

        // Show first page
        this.showPage(0);
        
        console.log('Intro pages started');
    }

    /**
     * Display a specific page
     */
    showPage(pageIndex) {
        if (pageIndex >= this.pages.length) {
            this.complete();
            return;
        }

        const page = this.pages[pageIndex];
        this.currentPage = pageIndex;

        // Build page HTML
        let html = '';

        if (page.image) {
            // Page with image and text
            html = `
                <div style="display: flex; gap: 30px; align-items: center; min-height: 400px;">
                    <div style="flex-shrink: 0;">
                        <img src="${page.image}" alt="Intro image" style="
                            max-width: 400px;
                            max-height: 400px;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        ">
                    </div>
                    <div style="flex: 1;">
                        <p style="font-size: 18px; line-height: 1.6; color: #2c3e50; text-align: left;">
                            ${page.text}
                        </p>
                    </div>
                </div>
            `;
        } else {
            // Text-only page (final page)
            html = `
                <div style="text-align: center; padding: 60px 20px;">
                    <p style="font-size: 24px; line-height: 1.6; color: #2c3e50; font-weight: 600;">
                        ${page.text}
                    </p>
                </div>
            `;
        }

        // Add navigation
        html += `
            <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
                <button id="intro-prev-btn" style="
                    background-color: #95a5a6;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    ${pageIndex === 0 ? 'visibility: hidden;' : ''}
                ">← Previous</button>
                
                <span style="color: #7f8c8d; font-size: 14px;">
                    Page ${pageIndex + 1} of ${this.pages.length}
                </span>
                
                <button id="intro-next-btn" style="
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">${pageIndex === this.pages.length - 1 ? 'Start Experiment' : 'Next →'}</button>
            </div>
        `;

        this.container.innerHTML = html;

        // Add event listeners
        const prevBtn = document.getElementById('intro-prev-btn');
        const nextBtn = document.getElementById('intro-next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
            prevBtn.addEventListener('mouseenter', () => {
                prevBtn.style.backgroundColor = '#7f8c8d';
            });
            prevBtn.addEventListener('mouseleave', () => {
                prevBtn.style.backgroundColor = '#95a5a6';
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
            nextBtn.addEventListener('mouseenter', () => {
                nextBtn.style.backgroundColor = '#2980b9';
            });
            nextBtn.addEventListener('mouseleave', () => {
                nextBtn.style.backgroundColor = '#3498db';
            });
        }

        console.log('Showing intro page:', pageIndex + 1);
    }

    /**
     * Go to previous page
     */
    previousPage() {
        if (this.currentPage > 0) {
            this.showPage(this.currentPage - 1);
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.showPage(this.currentPage + 1);
        } else {
            this.complete();
        }
    }

    /**
     * Complete intro pages and start experiment
     */
    complete() {
        console.log('Intro pages completed');

        // Remove intro container
        if (this.container) {
            this.container.remove();
        }

        // Show main container
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.display = 'flex';
        }

        // Start the experiment (tutorial)
        if (this.experiment.startAfterIntro) {
            this.experiment.startAfterIntro();
        }
    }
}