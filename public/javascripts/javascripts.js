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
const getDropdownComponents = () => {
  dropdown       = $(".dropdown");
  dropdownToggle = $(".dropdown-toggle");
  dropdownMenu   = $(".dropdown-menu");
}
const modifyDropdownProps = () => {
  // if the window size is greater than MIN_WIDTH then add some new classes & attrs for the dropdown components
  if (window.matchMedia("(min-width: " + MIN_WIDTH + "px)").matches) {
    // check if components fail to load
    if (dropdown === undefined || dropdownToggle === undefined || dropdownMenu === undefined) getDropdownComponents();
    
    dropdown.hover(inCallback, outCallback);
    return;
  } 
  // otherwise, remove the above added classes & attrs for the dropdown components
  dropdown.off("mouseenter mouseleave");
};
window.onresize = () => { 
  modifyDropdownProps();
}; 
window.onload = () => {
  getDropdownComponents();
  modifyDropdownProps();
};
// ------- end dropdown menu hover ---------

$('#updateProjectModal').on('show.bs.modal', (event) => {
  // get the button value which contain id, name of the current ul element
  let            updateButton = $(event.relatedTarget); // the update button that triggered the modal
  let   updateButtonWhatIdVal = updateButton.data('whatid'); 
  let updateButtonWhatNameVal = updateButton.data('whatname'); 
  // console.log(`!!!!!!!!!!!!!! updateButtonWhatVal= ${updateButtonWhatIdVal}, projectName= ${updateButtonWhatNameVal}, projectId= ${updateButtonWhatIdVal}`);
  
  // put the previous value into the modal field accrodingly
  $('input[name="projectIdInModal"]').val(updateButtonWhatIdVal);
  $('input[name="projectNameInModal"]').val(updateButtonWhatNameVal);

  // update the id to the modal field for backend to do crud
  $('#projectIdInModal').val(updateButtonWhatIdVal);
});
