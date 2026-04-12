/**
 * EMAIL PAGINATION SYSTEM
 * Handles pagination for email list and email content
 */

class EmailPagination {
    constructor(emailSystem) {
        this.emailSystem = emailSystem;
        this.emailsPerPage = 5; // Show 5 emails at a time
        this.currentEmailListPage = 1;
        this.currentEmailContentPage = 1;
        this.linesPerEmailPage = 20; // ~20 lines of email content per page
    }

    /**
     * Add pagination controls to email list
     */
    addEmailListPagination() {
        const emailList = document.getElementById('email-list');
        const parent = emailList.parentElement;
        
        // Create pagination container
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'email-list-pagination';
        paginationDiv.className = 'pagination-controls';
        paginationDiv.innerHTML = `
            <button class="page-btn" id="email-list-prev">← Previous</button>
            <span class="page-info" id="email-list-page-info">Page 1 of 1</span>
            <button class="page-btn" id="email-list-next">Next →</button>
        `;
        
        // Insert after email list
        parent.insertBefore(paginationDiv, emailList.nextSibling);
        
        // Add event listeners
        document.getElementById('email-list-prev').addEventListener('click', () => this.previousEmailListPage());
        document.getElementById('email-list-next').addEventListener('click', () => this.nextEmailListPage());
        
        // Initial render
        this.updateEmailListPage();
    }

    /**
     * Add pagination controls to email viewer
     */
    addEmailContentPagination(viewerElement) {
        const paginationDiv = document.createElement('div');
        paginationDiv.id = 'email-content-pagination';
        paginationDiv.className = 'pagination-controls';
        paginationDiv.innerHTML = `
            <button class="page-btn" id="email-content-prev">← Previous</button>
            <span class="page-info" id="email-content-page-info">Page 1 of 1</span>
            <button class="page-btn" id="email-content-next">Next →</button>
        `;
        
        viewerElement.appendChild(paginationDiv);
        
        document.getElementById('email-content-prev').addEventListener('click', () => this.previousEmailContentPage());
        document.getElementById('email-content-next').addEventListener('click', () => this.nextEmailContentPage());
    }

    /**
     * Update which emails are shown on current page
     */
    updateEmailListPage() {
        const allEmails = Array.from(document.querySelectorAll('.email-item'));
        const totalPages = Math.ceil(allEmails.length / this.emailsPerPage);
        
        const startIndex = (this.currentEmailListPage - 1) * this.emailsPerPage;
        const endIndex = startIndex + this.emailsPerPage;
        
        // Hide all emails
        allEmails.forEach((email, index) => {
            if (index >= startIndex && index < endIndex) {
                email.style.display = 'grid';
            } else {
                email.style.display = 'none';
            }
        });
        
        // Update pagination controls
        document.getElementById('email-list-page-info').textContent = `Page ${this.currentEmailListPage} of ${totalPages}`;
        document.getElementById('email-list-prev').disabled = this.currentEmailListPage === 1;
        document.getElementById('email-list-next').disabled = this.currentEmailListPage === totalPages;
    }

    /**
     * Go to previous page of emails
     */
    previousEmailListPage() {
        if (this.currentEmailListPage > 1) {
            this.currentEmailListPage--;
            this.updateEmailListPage();
        }
    }

    /**
     * Go to next page of emails
     */
    nextEmailListPage() {
        const allEmails = document.querySelectorAll('.email-item');
        const totalPages = Math.ceil(allEmails.length / this.emailsPerPage);
        
        if (this.currentEmailListPage < totalPages) {
            this.currentEmailListPage++;
            this.updateEmailListPage();
        }
    }

    /**
     * Split email content into pages
     */
    paginateEmailContent(bodyContent) {
        // Split by paragraphs or line breaks
        const parts = bodyContent.split(/<\/p>|<hr|<p style='margin: 20px 0/);
        
        const pages = [];
        let currentPage = '';
        let lineCount = 0;
        
        parts.forEach(part => {
            const estimatedLines = Math.ceil(part.length / 80); // Rough estimate
            
            if (lineCount + estimatedLines > this.linesPerEmailPage && currentPage) {
                pages.push(currentPage);
                currentPage = part;
                lineCount = estimatedLines;
            } else {
                currentPage += part;
                lineCount += estimatedLines;
            }
        });
        
        if (currentPage) {
            pages.push(currentPage);
        }
        
        return pages.length > 0 ? pages : [bodyContent];
    }

    /**
     * Update email content page
     */
    updateEmailContentPage(pages) {
        const bodyElement = document.querySelector('.email-full-body');
        if (!bodyElement) return;
        
        const totalPages = pages.length;
        
        bodyElement.innerHTML = pages[this.currentEmailContentPage - 1];
        
        const pageInfo = document.getElementById('email-content-page-info');
        const prevBtn = document.getElementById('email-content-prev');
        const nextBtn = document.getElementById('email-content-next');
        
        if (pageInfo) pageInfo.textContent = `Page ${this.currentEmailContentPage} of ${totalPages}`;
        if (prevBtn) prevBtn.disabled = this.currentEmailContentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentEmailContentPage === totalPages;
    }

    /**
     * Navigate email content pages
     */
    previousEmailContentPage() {
        if (this.currentEmailContentPage > 1) {
            this.currentEmailContentPage--;
            // Re-render current email
            this.emailSystem.refreshCurrentEmail();
        }
    }

    nextEmailContentPage() {
        this.currentEmailContentPage++;
        this.emailSystem.refreshCurrentEmail();
    }

    /**
     * Reset email content pagination
     */
    resetEmailContentPage() {
        this.currentEmailContentPage = 1;
    }
}