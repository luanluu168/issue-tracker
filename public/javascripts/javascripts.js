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
const handleVerifyIsHumanClick = () => {
  fetch('/security/server/verify-is-human', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'post',
      })
      .then(response => {
        console.log(`response.text= ${response.text()}`)
        response.text()
      })
      .then(text => console.log(`text= ${text}`))
      .catch(err => console.log(`Error in javascript fetch: ${err}`));
};

// for faster access
let        signupButton = $('button[name="signup-submit"]')
let        signinButton = $('button[name="signin-submit"]');
let  landingStartButton = $('button[name="landing-start-button"]');
let   saveProfileButton = $('button[name="save-profile-button"]');
let   googleOauthButton = $('a[class="google-auth-button"]');
let verifyIsHumanButton = $('button[name="verify-is-human-button"]');

// signup page element
const signupUserNameLabel = $('label[name="signup-input-user-name"]');
const signupInputUserName = $('input[name="userName"]');
const signupUserName = () => {
  signupInputUserName.on('focus', () => {
    signupUserNameLabel.removeClass('d-none');
  });
};
const signupUserEmailLabel = $('label[name="signup-input-user-email"]');
const signupInputUserEmail = $('input[name="userEmail"]');
const signupUserEmail = () => {
  signupInputUserEmail.on('focus', () => {
    signupUserEmailLabel.removeClass('d-none');
  });
};

const signupPasswordInput = $('#signup-password-container input');
const  signupPasswordSpan = $('#signup-password-container span');
const handleSignupPasswordIconClick = () => {
  signupPasswordSpan.on('click', () => {
    if(signupPasswordInput.attr('type') == 'text') {
      signupPasswordInput.attr('type', 'password');
    } else { // the case where signup-password-container's type is password
      signupPasswordInput.attr('type', 'text');
    }
    $('#toggle-password-icon').toggleClass('fa-eye fa-eye-slash');
  });
};
window.onload = () => {
  getDropdownComponents();
  modifyDropdownProps();

  $('#verify-is-human-button').submit(() => handleVerifyIsHumanClick);
  
  // signupUserName();
  // signupUserEmail();

  handleSignupPasswordIconClick();
};
// ------- end dropdown menu hover ---------

// --------- loading button setup ------------
landingStartButton.click(() => { landingStartButton.html(`<span class="spinner-border spinner-border-md mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`) });
signinButton.click(() => { signinButton.html(`<span class="spinner-border spinner-border-sm mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`) });
signupButton.click(() => { signupButton.html(`<span class="spinner-border spinner-border-sm mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`) });
saveProfileButton.click(() => { saveProfileButton.html(`<span class="spinner-border spinner-border-md mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`) });
googleOauthButton.click(() => { googleOauthButton.html(`<span class="spinner-border spinner-border-sm mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`) });
verifyIsHumanButton.click(() => { verifyIsHumanButton.html(`<span class="spinner-border spinner-border-sm mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`) });
// --------- end loading button setup --------

// -------      update project       -------
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
// -------    end update project    -------


// -------      update issue        -------
$('#updateIssueModal').on('show.bs.modal', (event) => {
  // get the button value which contain id, name of the row in the table
  let               updateButton = $(event.relatedTarget); // the update button that triggered the modal
  let      updateButtonWhatIdVal = updateButton.data('whatid'); 
  let updateButtonWhatSummaryVal = updateButton.data('whatsummary'); 
  
  // put the previous value into the modal field accrodingly
  $('input[name="issueIdInModal"]').val(updateButtonWhatIdVal);
  $('textarea[name="issueSummaryInModal"]').val(updateButtonWhatSummaryVal);

  // update the id to the modal field for backend to do crud
  $('#issueIdInModal').val(updateButtonWhatIdVal);

  // update project id and name
  let   updateButtonWhatPid = updateButton.data('whatpid');
  let updateButtonWhatPname = updateButton.data('whatpname');
  $('input[name="projectIdInModal"]').val(updateButtonWhatPid);
  $('input[name="projectNameInModal"]').val(updateButtonWhatPname);
});
// -------    end update issue   -------

const loadingButtonSetup = (obj, spinnerSize) => {
  $(obj).prop("disabled", true);
  // add spinner to button
  $(obj).html(`<span class="spinner-border spinner-border-${spinnerSize} mr-3" role="status" aria-hidden="true"></span> <strong>Loading...</strong>`);
};