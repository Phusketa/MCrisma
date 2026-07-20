/**
 * Hambúrguer da Crisma - Main Application JavaScript
 * Fixes:
 * 1. Resolved mobile/retina double-scaling canvas bug (dpr scaling in renderFrame)
 * 2. Optimized touch/scroll image sequence performance
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DOM Elements Reference
    // ----------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerClose = document.getElementById('drawer-close');
    
    // Ticket Sales Elements
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');
    const inputQty = document.getElementById('ticket-qty');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const btnBuyWhatsapp = document.getElementById('btn-buy-whatsapp');
    
    // Modal & Toast
    const modalPix = document.getElementById('modal-pix');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // ----------------------------------------------------------------------
    // 2. Constants & Settings
    // ----------------------------------------------------------------------
    const TICKET_PRICE = 30.00;
    const PHONE_WHATSAPP = '5521980130910'; // +55 (21) 98013-0910
    const TOTAL_FRAMES = 150;
    const FRAME_DIR = 'Hambuerger Feliz';
    
    // ----------------------------------------------------------------------
    // 3. Image Sequence Preloading & Canvas Logic
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('sequence-canvas');
    const ctx = canvas.getContext('2d');
    const frames = [];
    let imagesLoaded = 0;
    let currentFrameIndex = 0;

    function getFrameFilename(index) {
        const paddedNum = String(index).padStart(3, '0');
        return `${FRAME_DIR}/ezgif-frame-${paddedNum}.jpg`;
    }

    function preloadFrames() {
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFrameFilename(i);
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === 1) {
                    resizeCanvas();
                    renderFrame(0);
                }
            };
            frames.push(img);
        }
    }

    function renderFrame(index) {
        if (!frames[index] || !frames[index].complete) return;

        const img = frames[index];
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight;

        // Use COVER fit on mobile so the image touches left and right edges with 0 side margins!
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Mobile Edge-to-Edge Zoom: Zoom in 1.85x to make the hamburger character & halo fill 100% of the screen width with zero side margins!
            drawWidth = canvasWidth * 1.85;
            drawHeight = drawWidth / imgRatio;
        } else {
            // Desktop CONTAIN mode
            if (canvasRatio > imgRatio) {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * imgRatio;
            } else {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / imgRatio;
            }
        }

        const drawX = (canvasWidth - drawWidth) / 2;
        const drawY = (canvasHeight - drawHeight) / 2;

        // Reset transform to avoid cumulative scaling bugs
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }

    function resizeCanvas() {
        const container = canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set backing store dimensions to physical device pixels
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        
        // CSS display size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        renderFrame(currentFrameIndex);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });

    // ----------------------------------------------------------------------
    // 4. Scroll Sync Logic
    // ----------------------------------------------------------------------
    const scrollSection = document.getElementById('scroll-experience');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');

    function handleScrollSequence() {
        if (!scrollSection) return;

        const rect = scrollSection.getBoundingClientRect();
        const sectionHeight = scrollSection.offsetHeight - window.innerHeight;
        
        if (sectionHeight <= 0) return;

        let progress = -rect.top / sectionHeight;
        progress = Math.max(0, Math.min(1, progress));

        const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * TOTAL_FRAMES)
        );

        if (frameIndex !== currentFrameIndex) {
            currentFrameIndex = frameIndex;
            renderFrame(currentFrameIndex);
        }

        if (progress < 0.33) {
            step1.classList.add('active');
            step2.classList.remove('active');
            step3.classList.remove('active');
        } else if (progress >= 0.33 && progress < 0.66) {
            step1.classList.remove('active');
            step2.classList.add('active');
            step3.classList.remove('active');
        } else {
            step1.classList.remove('active');
            step2.classList.remove('active');
            step3.classList.add('active');
        }

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScrollSequence, { passive: true });

    // ----------------------------------------------------------------------
    // 5. Ticket Quantity Selector & WhatsApp Checkout
    // ----------------------------------------------------------------------
    function updateTotalPrice() {
        const qty = parseInt(inputQty.value, 10) || 1;
        const total = qty * TICKET_PRICE;
        
        const formattedTotal = total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        totalPriceDisplay.textContent = formattedTotal;
    }

    if (btnMinus && btnPlus && inputQty) {
        btnMinus.addEventListener('click', () => {
            let currentVal = parseInt(inputQty.value, 10) || 1;
            if (currentVal > 1) {
                inputQty.value = currentVal - 1;
                updateTotalPrice();
            }
        });

        btnPlus.addEventListener('click', () => {
            let currentVal = parseInt(inputQty.value, 10) || 1;
            if (currentVal < 50) {
                inputQty.value = currentVal + 1;
                updateTotalPrice();
            }
        });
    }

    // Direct Order via WhatsApp
    if (btnBuyWhatsapp) {
        btnBuyWhatsapp.addEventListener('click', () => {
            const qty = parseInt(inputQty.value, 10) || 1;
            const totalValue = (qty * TICKET_PRICE).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const textMessage = 
                `Paz e bem! 🍔✨\n\n` +
                `Gostaria de garantir meus convites para o *Hambúrguer da Crisma*!\n\n` +
                `📅 *Data:* 08 de Agosto às 19h (Após a Missa)\n` +
                `📍 *Local:* Paróquia São José (Estrada do Mapuá, 784 - Taquara)\n` +
                `🥤 *Combo:* Hambúrguer completo + Batata Frita + Refri 400ml\n\n` +
                `📋 *Detalhes do Pedido:*\n` +
                `• Quantidade: *${qty} convite(s)*\n` +
                `• Valor Total: *${totalValue}*\n\n` +
                `Como posso proceder para efetuar o pagamento e concluir o pedido? Aguardo retorno! 🙏🏼`;

            const encodedMessage = encodeURIComponent(textMessage);
            const whatsappUrl = `https://wa.me/${PHONE_WHATSAPP}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }

    // ----------------------------------------------------------------------
    // 6. Mobile Drawer Logic
    // ----------------------------------------------------------------------
    if (mobileToggle && mobileDrawer && drawerClose) {
        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.add('open');
        });

        drawerClose.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
        });
    }

    window.closeDrawer = function() {
        if (mobileDrawer) mobileDrawer.classList.remove('open');
    };

    // ----------------------------------------------------------------------
    // 7. Pix Modal Global Logic
    // ----------------------------------------------------------------------
    window.openPixModal = function() {
        if (modalPix) {
            modalPix.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closePixModal = function() {
        if (modalPix) {
            modalPix.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    window.closePixModalOnBackdrop = function(event) {
        if (event.target === modalPix) {
            closePixModal();
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalPix && modalPix.classList.contains('open')) {
            closePixModal();
        }
    });

    // ----------------------------------------------------------------------
    // 8. Initial Execution
    // ----------------------------------------------------------------------
    preloadFrames();
    updateTotalPrice();
    handleScrollSequence();
});
