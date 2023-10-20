// Global 
var $root = $(':root'),
	$bar = $('#bar'),
	$boxInput = $('input[name="box"]'),
	$boxAllInput = $('input[name="box-all"]'),
	$select = $('._select select');
	$toolsTrigger = $('#tools .tools_trigger');



// no skroll
var block = $('<div>').css({'height':'50px','width':'50px'}),
	indicator = $('<div>').css({'height':'200px'});

$('body').append(block.append(indicator));
var w1 = $('div', block).innerWidth();    
block.css('overflow-y', 'scroll');
var w2 = $('div', block).innerWidth();
$(block).remove();

var scrollbar = w1 - w2;

$root.css('--scroll', scrollbar + 'px');



// Ready
$(document).ready(function () {
	// Media
	$(window).resize(media);

	media();


	 $boxAllInput.change(function() {
        var isChecked = $(this).is(':checked');
        $boxInput.prop('checked', isChecked);
    });
    // Обробка окремих чекбоксів
    $boxInput.change(function() {
        var allChecked = $boxInput.length === $('input[name="box"]:checked').length;
        $boxAllInput.prop('checked', allChecked);
    });



    // Select
    if ($select.length) {
        $select.knotSelect();
    };


    $toolsTrigger.on('click', function(event) {
		$(this).toggleClass('active');
	});

	// Close outside
	$(document).on('click', function(event) {
		if ($(event.target).closest('#tools').length === 0) {
			$toolsTrigger.removeClass('active');
		}
	});
})


// Scroll
$(window).scroll(function () {
	var winowScroll = $(this).scrollTop();
})




/*
*			███████╗██╗░░░██╗███╗░░██╗░█████╗░░██████╗
*			██╔════╝██║░░░██║████╗░██║██╔══██╗██╔════╝
*			█████╗░░██║░░░██║██╔██╗██║██║░░╚═╝╚█████╗░
*			██╔══╝░░██║░░░██║██║╚████║██║░░██╗░╚═══██╗
*			██║░░░░░╚██████╔╝██║░╚███║╚█████╔╝██████╔╝
*			╚═╝░░░░░░╚═════╝░╚═╝░░╚══╝░╚════╝░╚═════╝░
*/


// Media
function media() {
	var windowWidth = $(window).width(),
		thresholdWidth;

	thresholdWidth = 900;
	moveElements($('#selector-desktop'), $('#selector-table'), windowWidth, thresholdWidth);
}

function moveElements($source, $destination, windowWidth, thresholdWidth) {
	if (windowWidth <= thresholdWidth - scrollbar) {
		$source.children().detach().prependTo($destination);
	} else {
		$destination.children().detach().prependTo($source);
	}
}




function barSize(trigger) {
	const $trigger = $(trigger);

	$bar.toggleClass('_small');
}



function listToggle(trigger) {
	const $trigger = $(trigger);
	const $list = $trigger.siblings('ul');

	$trigger.toggleClass('active');
	$list.slideToggle();
}



function tabsToggle(trigger, list) {
    const $trigger = $(trigger);
    const index = $trigger.parent().index();
    const $list = $(list);
    const $elmetn = $list.eq(index);

    $trigger.parent().addClass('active').siblings().removeClass('active');
    $list.not($elmetn).slideUp();
    $elmetn.slideDown();
}



$(document).ready(function() {
    const ctx = document.getElementById('barChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Vn', 'Sulf', 'FeOx', 'CuOx'],
            datasets: [{
                data: [100, 66, 82, 1],
                backgroundColor: '#45A5EA',
                hoverBackgroundColor: '#45A5EA',
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: '#3A4F73',
                        fontSize: 20,
                        fontStyle: 'bold'
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        stepSize: 10,
                        callback: function(value, index, values) {
                            if (value === 0) {
                                return value + '%';    
                            } else if (value === 100 || value % 20 === 0) {
                                return value;
                            }
                            return '';
                        },
                        fontColor: '#3A4F73',
                        fontSize: 20,
                        fontStyle: 'bold'
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false // Disable tooltip
            },
            plugins: {
                labels: {
                    render: function (args) {
                      return args.value + ' %';
                    },
                    fontColor: '#3A4F73',
                    fontStyle: 'bold',
                    fontSize: 18,
                    textMargin: -20
                }
            }
        }
    });
});


$(document).ready(function () {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Vn', 'Sulf', 'FeOx', 'CuOx'],
            datasets: [{
                data: [20, 15, 5, 60],
                backgroundColor: ['#EAD045', '#EA5945', '#3AD14A', '#45A5EA'],
                hoverBackgroundColor: ['#EAD045', '#EA5945', '#3AD14A', '#45A5EA'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 20,
                },
            },
        	tooltips: {
                enabled: false
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    padding: 10,
                    fontSize: 20,
                    fontStyle: 'bold',
                    fontColor: '#3A4F73'
                }
            },
            plugins: {
                labels: {
                    render: function (args) {
                      return args.value + ' %';
                    },
                    fontColor: '#3A4F73',
                    fontStyle: 'bold',
                    fontSize: 24,
                    position: 'border',
                }
            },
        }
    });
})


$(document).ready(function() {
    const ctx = document.getElementById('histogramChart').getContext('2d');

    new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: [186.4, 186.5, 186.6, 186.7, 186.8, 186.9, 187.0, 187.1, 187.2, 187.3],
            datasets: [{
                data: [10.3, 12.1, 15.1, 5.4, 7.2, 25.1, 18.1, 100, 25.1, 20],
                backgroundColor: '#45A5EA',
                hoverBackgroundColor: '#45A5EA',
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: '#3A4F73',
                        fontSize: 20,
                        fontStyle: 'bold'
                    }
                }],
                xAxes: [{
                    ticks: {
                        reverse: true, 
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        stepSize: 10,
                        callback: function(value, index, values) {
                            if (value === 0) {
                                return value + '%';    
                            } else if (value === 100 || value % 20 === 0) {
                                return value;
                            }
                            return '';
                        },
                        fontColor: '#3A4F73',
                        fontSize: 20,
                        fontStyle: 'bold'
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            },
            plugins: {
                labels: {
                    render: function (args) {
                      return args.value + ' %';
                    },
                    fontColor: '#3A4F73',
                    fontStyle: 'bold',
                    fontSize: 18,
                    textMargin: -20,
                }
            }
        }
    });
});



