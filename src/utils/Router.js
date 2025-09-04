/**
 * Simple client-side router for single page application
 */

const Router = (() => {
  let routes = {};
  let currentRoute = null;
  let defaultRoute = null;
  
  // Register a route
  const addRoute = (path, handler) => {
    routes[path] = handler;
  };
  
  // Set default route
  const setDefaultRoute = (path) => {
    defaultRoute = path;
  };
  
  // Navigate to a route
  const navigate = (path) => {
    if (routes[path]) {
      currentRoute = path;
      routes[path]();
      
      // Update URL without page reload
      if (window.history && window.history.pushState) {
        window.history.pushState({ path }, '', `#${path}`);
      } else {
        window.location.hash = path;
      }
    } else {
      console.warn(`Route not found: ${path}`);
      if (defaultRoute && routes[defaultRoute]) {
        navigate(defaultRoute);
      }
    }
  };
  
  // Get current route
  const getCurrentRoute = () => currentRoute;
  
  // Initialize router
  const init = () => {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const path = event.state?.path || getHashPath();
      if (path && routes[path]) {
        currentRoute = path;
        routes[path]();
      } else if (defaultRoute) {
        navigate(defaultRoute);
      }
    });
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const path = getHashPath();
      if (path && routes[path]) {
        currentRoute = path;
        routes[path]();
      }
    });
    
    // Navigate to initial route
    const initialPath = getHashPath() || defaultRoute;
    if (initialPath) {
      navigate(initialPath);
    }
  };
  
  // Get path from hash
  const getHashPath = () => {
    return window.location.hash.slice(1) || null;
  };
  
  return {
    addRoute,
    setDefaultRoute,
    navigate,
    getCurrentRoute,
    init
  };
})();

export default Router;
