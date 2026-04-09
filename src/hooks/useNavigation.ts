export const changeClassWhenResizeOnNavigation = () => {
  const navigation = document.querySelector('.l-navigation');
  const navigationList = document.querySelector('.l-navigation__list');
  const breakpointLg =
    getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-lg').trim() || '1024px';
  const mediaQuery = window.matchMedia(`(min-width: ${breakpointLg})`);

  if (!navigation || !navigationList) return;
  const showDesktop = () => {
    navigation.classList.add('l-navigation--isDesktop');
    navigationList.classList.remove('hidden');
    navigationList.classList.remove('opacity-0');
  };
  const showMobile = () => {
    navigation.classList.remove('l-navigation--isDesktop');
    navigationList.classList.add('hidden');
    navigationList.classList.add('opacity-0');
  };
  if (mediaQuery.matches) {
    showDesktop();
  } else {
    showMobile();
  }
  const checkAndRemoveClass = () => {
    if (mediaQuery.matches) {
      showDesktop();
    } else {
      showMobile();
    }
  };
  checkAndRemoveClass();
};
