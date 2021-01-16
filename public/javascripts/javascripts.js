// ------- dropdown menu hover ---------
let MIN_WIDTH      = 851;
let dropdown       = undefined;
let dropdownToggle = undefined;
let dropdownMenu   = undefined;
const inCallback   = () => { // the case where the dropdown menu is hovered
  dropdown.addClass("show");
  dropdownToggle.attr("aria-expanded", "true");
  dropdownMenu.addClass("show");
};
const outCallback = () => { // the case where the dropdown menu is not hovered
  dropdown.removeClass("show");
  dropdownToggle.attr("aria-expanded", "false");
  dropdownMenu.removeClass("show");
};
const modifyDropdownProps = () => {
  if (window.matchMedia("(min-width: " + MIN_WIDTH + "px)").matches) {
    if (dropdown === undefined || dropdownToggle === undefined || dropdownMenu === undefined) return;
    
    dropdown.hover(inCallback, outCallback);
    return;
  } 

  dropdown.off("mouseenter mouseleave");
};
window.onresize = () => { 
  modifyDropdownProps();
}; 
window.onload = () => {
  dropdown       = $(".dropdown");
  dropdownToggle = $(".dropdown-toggle");
  dropdownMenu   = $(".dropdown-menu");

  modifyDropdownProps();  
};
// ------- end dropdown menu hover ---------

