moment.locale('vi')
var dataSource = [];
var dataSourceDateList = [];
var earliestDay;
var latestDay;

var statusColor = [
    { id: 1001, name: 'colorFinished', color: '#07f198' },
    { id: 1002, name: 'colorDoing', color: '#2887f3' },
    { id: 1003, name: 'colorOverTime', color: '#f32828' },
    { id: 1004, name: 'colorIncoming', color: '#e434bb' }
]

$(document).ready(function () {
    getData()
})

function getData() {
    $.getJSON('data.json', function (data) {
        dataSource = data;
        renderListTask();
        renderColumns();
        renderRows();
    }).fail(function (e) {
        console.log(e);
    })
}


/* Tạo mảng 
    gồm những ngày từ ngày sớm nhất đến ngày muộn nhất 
*/
function updateDateList(startDate, stopDate) {

    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dataSourceDateList.push(new Date(currentDate));
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    return dataSourceDateList;
}



/**
 * ! Render table header
 */
function renderColumns() {
    var rowContent = '<tr>';
    // tìm ngày sớm nhất 
    earliestDay = new Date(dataSource[0].start_date)
    for (let i = 1; i < dataSource.length; i++) {
        var startDate = new Date(dataSource[i].start_date);
        var check = (earliestDay - startDate) / (1000 * 60 * 60 * 24);
        if (check > 0) {
            earliestDay = new Date(dataSource[i].start_date);
        }
    }

    // tìm ngày muộn nhất 
    latestDay = new Date(dataSource[0].end_date)
    for (let i = 1; i < dataSource.length; i++) {
        var endDate = new Date(dataSource[i].end_date);
        var check = (endDate - latestDay) / (1000 * 60 * 60 * 24);
        if (check > 0) {
            latestDay = new Date(dataSource[i].end_date);
        }
    }

    updateDateList(earliestDay, latestDay)
    // console.table(dataSourceDateList);

    /* Tạo số cột là columns */
    for (let i = 0; i < dataSourceDateList.length; i++) {
        rowContent += '<th> ' + moment(dataSourceDateList[i]).format('DD MMMM') + '</th>'
    }
    rowContent += '</tr>'
    $('#gantt-chart-table thead').append(rowContent)
    // console.log(rowContent);

}

/**
 * ! Render table body
 */
function renderRows() {

    var duration = 0;
    var rowContent = '';

    $.each(dataSource, function (index, item) {
        // if (item.parent == 0) {
        rowContent += '<tr id="timeline-' + item.id + '"></tr>';
        // gắn vào row trước để có id
        $('#gantt-chart-table tbody').append(rowContent)
        rowContent = ''; // reset content

        var endDate = new Date(item.end_date);
        var startDate = new Date(item.start_date);

        // lấy được khoảng t.gian mỗi item
        duration = (endDate - startDate) / (1000 * 60 * 60 * 24);

        // lấy màu của trạng thái
        var colorTimeline = statusColor[item.status - 1].color;

        // render ô trống trước duration 
        var spaceCell = (startDate - earliestDay) / (1000 * 60 * 60 * 24);
        for (let i = 0; i <= spaceCell; i++) {
            rowContent += '<td></td>'
        }

        // render duration riêng của từng item
        for (let d = 0; d < duration; d++) {
            if (duration == 1) {
                rowContent += '<td><div class="start-timeline end-timeline" style="width: calc(100%); background: ' + colorTimeline + ';"></div></td>';
            } else if (d == 0) {
                rowContent += '<td><div class="start-timeline" style="width: calc(100%); background: ' + colorTimeline + ';"></div></td>';
            } else if (d == duration - 1) {
                rowContent += '<td><div class="end-timeline" style="width: calc(100%); background: ' + colorTimeline + ';"></div></td>';
            } else
                rowContent += '<td><div style="width: calc(100%); background: ' + colorTimeline + ';"></div></td>';
        }

        // render ô trống còn lại
        var remainSpaceCell = (latestDay - endDate) / (1000 * 60 * 60 * 24);
        for (let i = 0; i <= remainSpaceCell; i++) {
            rowContent += '<td></td>'
        }

        // // gọi callback
        // const children = dataSource.filter(x => x.parent == item.id);
        // recursionRenderRow(children, item.id)

        // }

        // gắn vào timeline
        $('#timeline-' + item.id + '').append(rowContent);
        // add data attribute
        $('#timeline-' + item.id + ' td > div').attr({ 'data-bs-toggle': 'tooltip', 'data-bs-placement': 'top', 'title': item.text })
        rowContent = ''; // reset content
    })

    // $('#gantt-chart-table tbody').append(rowContent)
}
/**
 * ! đệ quy render row
 */
function recursionRenderRow(dataChildren, parentId) {
    var rowContent = '';
    // kiểm tra children
    if (dataChildren.length > 0) {
        $.each(dataChildren, function (index, item) {

        })
    }

}


/**
 * !!! Render list task below
 */
function renderListTask() {
    $.each(dataSource, function (index, item) {
        var taskContent = '';
        // in ra những task parent
        if (item.parent == 0) {
            taskContent += '<div id="' + item.id + '" class="task"><p>' + item.text + '</p></div>';

            // gắn vào trước mới có element để gọi id
            $('#task-list').append(taskContent);

            // truyền mảng con vào callback đệ quy
            const children = dataSource.filter(x => x.parent == item.id);
            recursion(children, item);
        }
    })
}

/**
 * ! hàm đệ quy 
 */
function recursion(dataChildren, parent) {
    if (dataChildren.length > 0) {
        // add class vào parent task
        $('#' + parent.id + '').addClass('has-task');
        $('#' + parent.id + '').prepend('<i class="far fa-folder-open" onclick="toggleTask(' + parent.id + ')"></i>')

        var taskContent = '';
        $.each(dataChildren, function (index, item) {
            taskContent += '<div id="' + item.id + '" class="task sub-task"><p>' + item.text + '</p></div>';

            // gắn vào trước mới có element để gọi id
            $('#' + parent.id + '').append(taskContent);
            // reset content
            taskContent = '';
            // truyền mảng con vào callback đệ quy
            const children = dataSource.filter(x => x.parent == item.id);
            recursion(children, item);
        })
    }
}



/**
 * !!! Toggle task
 */
var taskFlag = true;
function toggleTask(id) {
    var subtasks = $('#' + id + ' .sub-task');
    var timelines = $('tbody tr');
    if (taskFlag) {
        subtasks.hide();
        $.each(subtasks, function (index, item) {
            $('#timeline-' + item.id + '').hide();
        })
        taskFlag = false;
    } else {
        subtasks.show();
        $.each(subtasks, function (index, item) {
            $('#timeline-' + item.id + '').show();
        })
        taskFlag = true;
    }
}