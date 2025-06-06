// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAqfvtbxCadebuMhLyZS-MB8Ypx3i53G74",
    authDomain: "trekkandtravels-website.firebaseapp.com",
    databaseURL: "https://trekkandtravels-website-default-rtdb.firebaseio.com",
    projectId: "trekkandtravels-website",
    storageBucket: "trekkandtravels-website.firebasestorage.app",
    messagingSenderId: "297807374917",
    appId: "1:297807374917:web:416b0710397e6b20bc112c"
};
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const database = firebase.database();
const storage = firebase.storage();
const packagesRef = database.ref('packages');

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const categoryParam = urlParams.get('category');
const packageId = urlParams.get('id');
const isEditing = !!packageId;

// Update page title and form based on mode
if (isEditing) {
    document.getElementById('pageTitle').textContent = 'Edit Package';
}

// Add inclusion input
function addInclusionInput(title = '', description = '') {
    const inclusionsContainer = document.getElementById('inclusionsContainer');
    const inclusionItem = document.createElement('div');
    inclusionItem.className = 'inclusion-item space-y-2 p-4 border border-gray-200 rounded-lg';
    inclusionItem.innerHTML = `
        <div class="flex items-center justify-between">
            <input type="text" class="inclusion-title w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2" placeholder="Inclusion Title" value="${title}">
            <button type="button" class="remove-inclusion bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <textarea class="inclusion-description w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="2" placeholder="Inclusion Description">${description}</textarea>
    `;
    inclusionsContainer.appendChild(inclusionItem);

    // Add event listener to remove button
    inclusionItem.querySelector('.remove-inclusion').addEventListener('click', function() {
        inclusionItem.remove();
    });
}

// Add exclusion input
function addExclusionInput(title = '', description = '') {
    const exclusionsContainer = document.getElementById('exclusionsContainer');
    const exclusionItem = document.createElement('div');
    exclusionItem.className = 'exclusion-item space-y-2 p-4 border border-gray-200 rounded-lg';
    exclusionItem.innerHTML = `
        <div class="flex items-center justify-between">
            <input type="text" class="exclusion-title w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2" placeholder="Exclusion Title" value="${title}">
            <button type="button" class="remove-exclusion bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <textarea class="exclusion-description w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="2" placeholder="Exclusion Description">${description}</textarea>
    `;
    exclusionsContainer.appendChild(exclusionItem);

    // Add event listener to remove button
    exclusionItem.querySelector('.remove-exclusion').addEventListener('click', function() {
        exclusionItem.remove();
    });
}

// Add highlight input
function addHighlightInput(value = '') {
    const highlightsContainer = document.getElementById('highlightsContainer');
    const highlightItem = document.createElement('div');
    highlightItem.className = 'highlight-item flex items-center space-x-2';
    highlightItem.innerHTML = `
        <input type="text" class="highlight-input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter highlight point" value="${value}">
        <button type="button" class="remove-highlight bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    `;
    highlightsContainer.appendChild(highlightItem);

    // Add event listener to remove button
    highlightItem.querySelector('.remove-highlight').addEventListener('click', function() {
        highlightItem.remove();
    });
}

// Add FAQ item function
function addFaqItem(question = '', answer = '') {
    const faqContainer = document.getElementById('faqContainer');
    if (!faqContainer) {
        console.error('FAQ container not found');
        return;
    }

    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item space-y-2 p-4 border border-gray-200 rounded-lg';
    faqItem.innerHTML = `
        <div class="flex items-center justify-between">
            <input type="text" class="faq-question w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2" placeholder="Question" value="${question}">
            <button type="button" class="remove-faq bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <textarea class="faq-answer w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="2" placeholder="Answer">${answer}</textarea>
    `;
    faqContainer.appendChild(faqItem);

    // Add event listener to remove button
    const removeButton = faqItem.querySelector('.remove-faq');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            faqItem.remove();
        });
    }
}

// Function to setup existing element remove buttons
function setupExistingRemoveButtons() {
    // Setup existing highlight remove buttons
    document.querySelectorAll('.remove-highlight').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.highlight-item').remove();
        });
    });

    // Setup existing inclusion remove buttons
    document.querySelectorAll('.remove-inclusion').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.inclusion-item').remove();
        });
    });

    // Setup existing exclusion remove buttons
    document.querySelectorAll('.remove-exclusion').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.exclusion-item').remove();
        });
    });

    // Setup existing FAQ remove buttons
    document.querySelectorAll('.remove-faq').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            this.closest('.faq-item').remove();
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup existing remove buttons first
    setupExistingRemoveButtons();

    // Set up event listeners for add buttons
    const addInclusionBtn = document.getElementById('addInclusion');
    if (addInclusionBtn) {
        addInclusionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addInclusionInput();
        });
    }

    const addExclusionBtn = document.getElementById('addExclusion');
    if (addExclusionBtn) {
        addExclusionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addExclusionInput();
        });
    }

    const addHighlightBtn = document.getElementById('addHighlight');
    if (addHighlightBtn) {
        addHighlightBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addHighlightInput();
        });
    }

    // FAQ button event listener - THIS IS THE MAIN FIX
    const addFaqBtn = document.getElementById('addFaq');
    if (addFaqBtn) {
        addFaqBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Adding new FAQ item'); // Debug log
            addFaqItem();
        });
    } else {
        console.error('Add FAQ button not found');
    }

    // Handle image preview
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                        imagePreview.classList.remove('hidden');
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission
    const packageForm = document.getElementById('packageForm');
    if (packageForm) {
        packageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const packageType = document.getElementById('packageType').value;
            const packageData = {
                place: document.getElementById('place').value,
                days: `${String(document.getElementById('days').value).padStart(2, '0')} Days / ${String(Number(document.getElementById('days').value) - 1).padStart(2, '0')} Nights`,
                price: Number(document.getElementById('price').value.replace(/,/g, '')) || null,
                description: document.getElementById('description').value,
                highlights: Array.from(document.querySelectorAll('.highlight-input'))
                    .map(input => input.value)
                    .filter(value => value.trim() !== ''),
                inclusions: Array.from(document.querySelectorAll('.inclusion-item'))
                    .map(item => ({
                        title: item.querySelector('.inclusion-title').value.trim(),
                        description: item.querySelector('.inclusion-description').value.trim()
                    }))
                    .filter(item => item.title !== '' || item.description !== ''),
                exclusions: Array.from(document.querySelectorAll('.exclusion-item'))
                    .map(item => ({
                        title: item.querySelector('.exclusion-title').value.trim(),
                        description: item.querySelector('.exclusion-description').value.trim()
                    }))
                    .filter(item => item.title !== '' || item.description !== ''),
                faq: Array.from(document.querySelectorAll('.faq-item'))
                    .map(item => ({
                        question: item.querySelector('.faq-question').value.trim(),
                        answer: item.querySelector('.faq-answer').value.trim()
                    }))
                    .filter(item => item.question !== '' && item.answer !== '')
            };

            try {
                // Handle image upload
                const imageFile = document.getElementById('imageUpload').files[0];
                if (imageFile) {
                    const storageRef = storage.ref();
                    const imageRef = storageRef.child(`packages/${Date.now()}_${imageFile.name}`);
                    await imageRef.put(imageFile);
                    packageData.imageUrl = await imageRef.getDownloadURL();
                }

                // Save to database
                if (isEditing) {
                    await packagesRef.child(categoryParam).child(packageId).update(packageData);
                } else {
                    await packagesRef.child(packageType).push(packageData);
                }

                alert(isEditing ? 'Package updated successfully!' : 'Package added successfully!');
                window.location.href = 'packages.html';
            } catch (error) {
                console.error('Error:', error);
                alert('Error saving package: ' + error.message);
            }
        });
    }

    // Load package data if editing
    if (isEditing) {
        loadPackageData();
    }
});

// Updated loadPackageData function with proper type handling
function loadPackageData() {
    packagesRef.child(categoryParam).child(packageId).once('value', (snapshot) => {
        const packageData = snapshot.val();
        if (packageData) {
            document.getElementById('packageType').value = categoryParam;
            document.getElementById('place').value = packageData.place || '';

            // Handle days/duration with proper type checking and string format
            let daysValue = '';
            if (typeof packageData.days === 'number') {
                daysValue = packageData.days;
            } else if (typeof packageData.days === 'string') {
                // Extract days from format like "05 Days / 04 Nights"
                const match = packageData.days.match(/(\d+)\s*Days/i);
                if (match) {
                    daysValue = parseInt(match[1], 10);
                }
            } else if (typeof packageData.duration === 'number') {
                daysValue = packageData.duration;
            }
            document.getElementById('days').value = daysValue;
            
            // Handle price with proper formatting
            let priceValue = '';
            if (typeof packageData.price === 'number') {
                priceValue = packageData.price;
            } else if (typeof packageData.price === 'string') {
                priceValue = Number(packageData.price.replace(/,/g, '')) || '';
            }
            document.getElementById('price').value = priceValue;
            document.getElementById('description').value = packageData.description || '';

            // Load highlights
            if (packageData.highlights) {
                const highlightsContainer = document.getElementById('highlightsContainer');
                // Clear existing highlights and add new ones
                highlightsContainer.innerHTML = '';
                packageData.highlights.forEach((highlight) => {
                    addHighlightInput(highlight);
                });
            }

            // Load inclusions
            if (packageData.inclusions) {
                const inclusionsContainer = document.getElementById('inclusionsContainer');
                inclusionsContainer.innerHTML = '';
                packageData.inclusions.forEach((item) => {
                    addInclusionInput(item.title || item, item.description || '');
                });
            }

            // Load exclusions
            if (packageData.exclusions) {
                const exclusionsContainer = document.getElementById('exclusionsContainer');
                exclusionsContainer.innerHTML = '';
                packageData.exclusions.forEach((item) => {
                    addExclusionInput(item.title || item, item.description || '');
                });
            }

            // Load FAQ data
            const faqContainer = document.getElementById('faqContainer');
            if (faqContainer) {
                faqContainer.innerHTML = ''; // Clear existing items
                if (packageData.faq && packageData.faq.length > 0) {
                    packageData.faq.forEach((item) => {
                        addFaqItem(item.question || '', item.answer || '');
                    });
                } else {
                    // If no FAQ data, add one empty item
                    addFaqItem('', '');
                }
            }

            // Load image
            if (packageData.imageUrl) {
                const imagePreview = document.getElementById('imagePreview');
                if (imagePreview) {
                    imagePreview.src = packageData.imageUrl;
                    imagePreview.classList.remove('hidden');
                }
            }
        }
    });
}
