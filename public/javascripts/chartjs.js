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

const renderChart = (data, labels, issueData, issueLabels) => {
    // console.log(`!!!!! renderChart is called, labels= ${labels}, data= ${JSON.stringify(data)}, data.length= ${data.length}`);
    let ctx = document.getElementById("myChart").getContext('2d');
    let chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Projects',
                    backgroundColor: 'rgba(159,170,174,0.8)',
                    borderWidth: 2,
                    hoverBackgroundColor: 'rgb(2, 117, 216, 0.8)',
                    hoverBorderColor: "blue",
                    scaleStepWidth: 1,
                    data: data,
                    borderColor: 'rgb(21, 205, 114, 1)',
                    backgroundColor: 'rgb(21, 205, 114, 0.2)'
                },
                {
                    label: 'Issues',
                    data: issueData,
                    borderWidth: 2,
                    hoverBackgroundColor: 'rgb(2, 117, 216, 0.8)',
                    hoverBorderColor: "blue",
                    scaleStepWidth: 1,
                    borderColor: 'rgba(255, 0, 0, 1)',
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                }
            ]
        },
        options: {
            scaleFontColor: 'red',
            responsive: true,
            tooltips: {
                mode: 'single'
            },
            scales: {
                xAxes: [{ 
                    gridLines: {
                        color: 'white', 
                        display: false, 
                    },
                    ticks: { 
                        fontColor: 'white',
                        fontSize: 15
                    },
                }],
                yAxes: [{ 
                    gridLines: { 
                        color: 'white', 
                        display: false
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'white',
                        callback: function (value, index, values) {
                            return value;
                        }
                    },
                    scaleLabel: {
                        display: true,
                        fontColor: 'white',
                        fontSize: 15,
                        labelString: 'Projects and Issues'
                    }
                }]
            },
        }
    });
}

const getChartData = () => {
    // console.log(`getChartData is called`);
    $("#loadingMessage").html('<img src="/assets/spinner360.gif" alt="" srcset="">');
    
    fetch('/chart', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST'
      })
      .then(response => {
        //   console.log(`response 1 = ${response}`);
          return response.json();
      })
      .then(response => {
        $("#loadingMessage").html("");
        // console.log(`response= ${JSON.stringify(response[0])}`);
        // alert(JSON.stringify(response));
        let   projectData = [];
        let projectLabels = [];
        let     issueData = [];
        let   issueLabels = [];

        const { projects, issues } = response;
        // grouping projects by date
        const projectGroups = projects.reduce((groups, project) => {
            // console.log(`%%%%%% project= ${JSON.stringify(project)}, groups= ${JSON.stringify(groups)}`);
            const date = project.created_on.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(project);
            return groups;
        }, {});
        // console.log(`!!!!! projectGroups= ${JSON.stringify(projectGroups)}`);

        const projectGroupArrays = Object.keys(projectGroups).map((date) => {
            return {
                date,
                project: projectGroups[date]
            };
        });
        // console.log(`projectGroupArrays= ${JSON.stringify(projectGroupArrays)}`);

        projectGroupArrays.forEach((item) => {
            projectData.push(item.project.length);
            projectLabels.push(item.date);
        });

        // grouping issues by date
        const issueGroups = issues.reduce((groups, issue) => {
            // console.log(`%%%%%% issue= ${JSON.stringify(issue)}, groups= ${JSON.stringify(groups)}`);
            const date = issue.created_on.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(issue);
            return groups;
        }, {});
        // console.log(`!!!!! issueGroups= ${JSON.stringify(issueGroups)}`);

        const issueGroupArrays = Object.keys(issueGroups).map((date) => {
            return {
                date,
                issue: issueGroups[date]
            };
        });
        // console.log(`issueGroupArrays= ${JSON.stringify(issueGroupArrays)}`);

        issueGroupArrays.forEach((item) => {
            issueData.push(item.issue.length);
            issueLabels.push(item.date);
        });
        
        renderChart(projectData, projectLabels, issueData, issueLabels);
      })
      .catch(err => console.log(`Error in javascript fetch: ${err}`));
}

window.onload = () => {
    getChartData();
    modifyDropdownProps();
};
