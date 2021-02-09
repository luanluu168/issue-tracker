const renderChart = (data, labels) => {
    console.log(`!!!!! renderChart is called, labels= ${labels}, data= ${JSON.stringify(data)}, data.length= ${data.length}`);
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
                }
                // {
                //     label: 'Issues',
                //     data: data[1].issues,
                //     borderColor: 'rgba(192, 192, 192, 1)',
                //     backgroundColor: 'rgba(192, 192, 192, 0.2)',
                // }
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
                        labelString: 'Projects'
                    }
                }]
            },
        }
    });
}

const getChartData = () => {
    console.log(`getChartData is called`);
    $("#loadingMessage").html('<img src="/assets/spinner360.gif" alt="" srcset="">');
    
    fetch('/chart', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST'
      })
      .then(response => {
          console.log(`response 1 = ${response}`);
          return response.json();
      })
      .then(response => {
        $("#loadingMessage").html("");
        console.log(`response= ${JSON.stringify(response[0])}`);
        // alert(JSON.stringify(response));
        let   data = [];
        let labels = [];

        const groups = response.reduce((groups, project) => {
            // console.log(`%%%%%% project= ${JSON.stringify(project)}, groups= ${JSON.stringify(groups)}`);
            const date = project.created_on.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(project);
            return groups;
        }, {});
        // console.log(`!!!!! groups= ${JSON.stringify(groups)}`);

        const groupArrays = Object.keys(groups).map((date) => {
            return {
                date,
                project: groups[date]
            };
        });
        // console.log(`groupArrays= ${JSON.stringify(groupArrays)}`);

        groupArrays.forEach((item) => {
            data.push(item.project.length);
            labels.push(item.date);
        });
        
        renderChart(data, labels);
      })
      .catch(err => console.log(`Error in javascript fetch: ${err}`));
}

window.onload = () => {
    getChartData();
};