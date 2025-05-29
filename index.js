// TrekkandTravel Admin Dashboard - Professional JavaScript Module
// Author: Admin Panel System
// Version: 1.0.0

class TrekkandTravelAdmin {
    constructor() {
        this.firebase = null;
        this.database = null;
        this.destinations = [
            'Alleppey', 'Calicut', 'Coorg', 'Kannur', 'Kasaragod', 'Kochi', 'Kodaikanal',
            'Kumarakom', 'Malappuram', 'Munnar', 'Ooty', 'Thekkady',
            'Thiruvananthapuram', 'Thrissur', 'Vagamon', 'Wayanad'
        ];
        this.data = {
            resorts: {},
            packages: {},
            stats: {
                resortCount: 0,
                packageCount: 0,
                destinationCount: 0,
                packageTypes: {
                    family: 0,
                    honeymoon: 0,
                    holiday: 0
                },
                destinationCounts: {}
            }
        };
        
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            this.showLoading();
            await this.initializeFirebase();
            this.setupEventListeners();
            this.setupUI();
            await this.loadData();
            this.hideLoading();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    // Firebase Configuration and Initialization
    async initializeFirebase() {
        try {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
            const { getDatabase, ref, onValue } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
            
            const firebaseConfig = {
                apiKey: "AIzaSyAqfvtbxCadebuMhLyZS-MB8Ypx3i53G74",
                authDomain: "trekkandtravels-website.firebaseapp.com",
                databaseURL: "https://trekkandtravels-website-default-rtdb.firebaseio.com",
                projectId: "trekkandtravels-website",
                storageBucket: "trekkandtravels-website.firebasestorage.app",
                messagingSenderId: "297807374917",
                appId: "1:297807374917:web:416b0710397e6b20bc112c"
            };

            this.firebase = initializeApp(firebaseConfig);
            this.database = getDatabase(this.firebase);
            
            // Store Firebase functions for later use
            this.firebaseRef = ref;
            this.firebaseOnValue = onValue;
            
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw new Error('Failed to initialize Firebase');
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Stats dropdown handlers
        document.querySelectorAll('.stats-dropdown').forEach(button => {
            button.addEventListener('click', (e) => this.toggleStatsDropdown(e.target.closest('.dropdown-container')));
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    // UI Setup
    setupUI() {
        // Set current date
        const currentDate = document.getElementById('currentDate');
        if (currentDate) {
            const today = new Date();
            currentDate.textContent = today.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Setup destination grid
        this.setupDestinationGrid();
    }

    // Data Loading and Management
    async loadData() {
        try {
            console.log('Starting data load...');
            await Promise.all([
                this.loadResorts(),
                this.loadPackages()
            ]);
            console.log('Data loaded successfully');
            this.updateAllStats();
        } catch (error) {
            console.error('Data loading error:', error);
            this.showError('Failed to load data');
        }
    }

    loadResorts() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Loading resorts...');
                const resortsRef = this.firebaseRef(this.database, 'Resorts');
                this.firebaseOnValue(resortsRef, (snapshot) => {
                    const data = snapshot.val();
                    console.log('Raw resorts data:', data);
                    
                    // Process resorts data and count total resorts
                    const processedResorts = {};
                    let totalResorts = 0;
                    
                    Object.entries(data || {}).forEach(([location, resorts]) => {
                        Object.entries(resorts).forEach(([id, resort]) => {
                            processedResorts[id] = {
                                ...resort,
                                id: id,
                                location: location
                            };
                            totalResorts++;
                        });
                    });
                    
                    this.data.resorts = processedResorts;
                    this.data.stats.resortCount = totalResorts;
                    console.log('Processed resorts:', this.data.resorts);
                    console.log('Total resorts:', totalResorts);
                    
                    this.calculateResortStats();
                    resolve();
                }, {
                    onlyOnce: false
                });
            } catch (error) {
                console.error('Error loading resorts:', error);
                reject(error);
            }
        });
    }

    loadPackages() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Loading packages...');
                const packagesRef = this.firebaseRef(this.database, 'packages');
                this.firebaseOnValue(packagesRef, (snapshot) => {
                    const data = snapshot.val();
                    console.log('Packages data:', data);
                    
                    // Initialize package containers
                    const allPackages = {};
                    
                    // Process each package category
                    Object.entries(data || {}).forEach(([category, packages]) => {
                        Object.entries(packages).forEach(([id, packageData]) => {
                            allPackages[id] = {
                                ...packageData,
                                type: category.toLowerCase().replace(' packages', '')
                            };
                        });
                    });
                    
                    this.data.packages = allPackages;
                    
                    // Count packages by type
                    const packages = Object.values(this.data.packages);
                    this.data.stats.packageTypes = {
                        family: packages.filter(pkg => pkg.type === 'family').length,
                        honeymoon: packages.filter(pkg => pkg.type === 'honeymoon').length,
                        holiday: packages.filter(pkg => pkg.type === 'holiday').length
                    };
                    
                    console.log('Package types:', this.data.stats.packageTypes);
                    this.calculatePackageStats();
                    resolve();
                }, {
                    onlyOnce: false
                });
            } catch (error) {
                console.error('Error loading packages:', error);
                reject(error);
            }
        });
    }

    calculateResortStats() {
        const resorts = Object.values(this.data.resorts);
        this.data.stats.resortCount = resorts.length;
        
        // Count resorts by destination
        this.data.stats.destinationCounts = {};
        this.destinations.forEach(dest => {
            this.data.stats.destinationCounts[dest.toLowerCase()] = 0;
        });
        
        resorts.forEach(resort => {
            const destination = resort.destination?.toLowerCase();
            if (destination && this.data.stats.destinationCounts.hasOwnProperty(destination)) {
                this.data.stats.destinationCounts[destination]++;
            }
        });
        
        this.updateResortUI();
    }

    calculatePackageStats() {
        const packages = Object.values(this.data.packages);
        this.data.stats.packageCount = packages.length;
        
        // Reset package type counts
        this.data.stats.packageTypes = {
            family: 0,
            honeymoon: 0,
            holiday: 0
        };
        
        // Count packages by type and destination
        packages.forEach(pkg => {
            const type = pkg.type?.toLowerCase();
            if (type && this.data.stats.packageTypes.hasOwnProperty(type)) {
                this.data.stats.packageTypes[type]++;
            }
            
            const destination = pkg.destination?.toLowerCase();
            if (destination && this.data.stats.destinationCounts.hasOwnProperty(destination)) {
                this.data.stats.destinationCounts[destination]++;
            }
        });
        
        this.updatePackageUI();
    }

    updateAllStats() {
        // Calculate active destinations
        this.data.stats.destinationCount = Object.values(this.data.stats.destinationCounts)
            .reduce((count, destCount) => count + (destCount > 0 ? 1 : 0), 0);
        
        this.updateStatsUI();
        this.updateDestinationGrid();
        this.updateDestinationDropdowns();
    }

    // UI Update Methods
    updateResortUI() {
        const resortCountEl = document.getElementById('resortCount');
        if (resortCountEl) {
            this.animateNumber(resortCountEl, this.data.stats.resortCount);
            resortCountEl.classList.remove('loading-skeleton');
        }
    }

    updatePackageUI() {
        const packageCountEl = document.getElementById('packageCount');
        if (packageCountEl) {
            this.animateNumber(packageCountEl, this.data.stats.packageCount);
            packageCountEl.classList.remove('loading-skeleton');
        }
        
        // Update package type counts
        Object.entries(this.data.stats.packageTypes).forEach(([type, count]) => {
            const element = document.getElementById(`${type}PackageCount`);
            if (element) {
                element.textContent = count;
            }
        });
    }

    updateStatsUI() {
        const destinationCountEl = document.getElementById('destinationCount');
        if (destinationCountEl) {
            this.animateNumber(destinationCountEl, this.data.stats.destinationCount);
            destinationCountEl.classList.remove('loading-skeleton');
        }
    }

    setupDestinationGrid() {
        const grid = document.getElementById('destinationGrid');
        if (!grid) return;

        grid.innerHTML = this.destinations.map((dest, index) => `
            <div class="bg-gray-50 rounded-lg p-4 text-center card-hover cursor-pointer" data-destination="${dest.toLowerCase()}">
                <div class="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <i class="fas fa-map-marker-alt text-white"></i>
                </div>
                <h4 class="font-medium text-gray-800 mb-1">${dest}</h4>
                <p class="text-2xl font-bold text-blue-600" id="grid-${dest.toLowerCase()}-count">0</p>
                <p class="text-xs text-gray-500">Total Items</p>
            </div>
        `).join('');
        
        // Add click handlers
        grid.querySelectorAll('[data-destination]').forEach(card => {
            card.addEventListener('click', () => {
                const destination = card.dataset.destination;
                this.showDestinationDetails(destination);
            });
        });
    }

    updateDestinationGrid() {
        Object.entries(this.data.stats.destinationCounts).forEach(([dest, count]) => {
            // Update grid
            const gridElement = document.getElementById(`grid-${dest}-count`);
            if (gridElement) {
                this.animateNumber(gridElement, count);
            }
        });
    }

    updateDestinationDropdowns() {
        const container = document.getElementById('resortDestinations');
        if (!container) return;

        container.innerHTML = Object.entries(this.data.stats.destinationCounts)
            .filter(([_, count]) => count > 0)
            .map(([dest, count]) => `
                <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span class="text-sm text-gray-600 capitalize">${dest}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium">${count}</span>
                        <div class="flex space-x-1">
                            <button class="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Edit</button>
                            <button class="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    toggleStatsDropdown(container) {
        const content = container.querySelector('.stats-content');
        const arrow = container.querySelector('.stats-arrow');
        const isOpen = !content.classList.contains('hidden');

        content.classList.toggle('hidden');
        if (arrow) {
            arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    handleOutsideClick(event) {
        if (!event.target.closest('.dropdown-container')) {
            document.querySelectorAll('.stats-content').forEach(el => {
                el.classList.add('hidden');
            });
        }
    }

    showDestinationDetails(destination) {
        // Implement destination details view
        console.log(`Showing details for ${destination}`);
        // You can implement a modal or redirect to a details page
    }

    showLoading() {
        document.querySelectorAll('.loading-skeleton').forEach(el => {
            el.classList.add('animate-pulse');
        });
    }

    hideLoading() {
        document.querySelectorAll('.loading-skeleton').forEach(el => {
            el.classList.remove('animate-pulse');
        });
    }

    showError(message) {
        console.error(message);
        // Implement error notification UI
    }

    animateNumber(element, value) {
        const duration = 1000;
        const start = parseInt(element.textContent) || 0;
        const increment = (value - start) / (duration / 16);
        let current = start;

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
                element.textContent = value;
                return;
            }
            element.textContent = Math.round(current);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', () => {
    const admin = new TrekkandTravelAdmin();
});