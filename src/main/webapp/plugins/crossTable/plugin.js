/**
 * Created by Fine on 2016/12/4.
 */

var crossTable = {
    table: function (args) {
        var data = args.data,
            chartConfig = args.chartConfig,
            tall = args.tall,
            pageDataNum = 10,
            drill = args.drill,
            random = Math.random().toString(36).substring(2),
            container = args.container;
        var html = "<table class = 'table_wrapper' id='tableWrapper" + random + "'><thead class='fixedHeader'>",
            colContent = "<tr>";
        for (var i = 0; i < chartConfig.groups.length; i++) {
            var groupId = chartConfig.groups[i].id;
            var colspan = 1;
            var colList = [];
            for (var t = 0; t < chartConfig.keys.length; t++) {
                colContent += "<th class=" + data[i][t].property + "><div></div></th>";
            }
            for (var y = chartConfig.keys.length; y < data[i].length; y++) {
                if ((data[i][y + 1]) && (data[i][y].data == data[i][y + 1].data)) {
                    if (i > 0) {
                        var noEqual = false;
                        for (var s = i - 1; s > -1; s--) {
                            if (data[s][y].data != data[s][y + 1].data) {
                                noEqual = true;
                                break;
                            }
                        }
                        if (noEqual) {
                            colList.push({
                                data: data[i][y].data,
                                colSpan: colspan,
                                property: data[i][y].property
                            });
                            colspan = 1;
                        }
                        else {
                            colspan++;
                        }
                    }
                    else if (i == 0) {
                        colspan++;
                    }
                }
                else {
                    data[i][y] != data[i][y - 1] ? colList.push({
                        data: data[i][y].data,
                        colSpan: colspan,
                        property: data[i][y].property
                    }) : null;
                    colspan = 1;
                }
            }
            for (var c = 0; c < colList.length; c++) {
                var d = ""
                if (drill && drill.config[groupId] && (drill.config[groupId].down || drill.config[groupId].up)) {
                    d += "class='table_drill_cell'";
                    if (drill.config[groupId].down) {
                        d += " drill-down='" + groupId + "' ";
                    }
                    if (drill.config[groupId].up) {
                        d += " drill-up='" + groupId + "' ";
                    }
                }
                var value = "<div " + d + ">" + colList[c].data + "</div>";
                colContent += colList[c].colSpan > 1 ? "<th colspan=" + colList[c].colSpan +
                    " class=" + colList[c].property + ">" + value + "</th>" :
                    "<th class=" + colList[c].property + ">" + value + "</th>";
            }
            colContent += "</tr><tr>";
        }
        for (var k = 0; k < data[chartConfig.groups.length].length; k++) {
            colContent += "<th class=" + data[chartConfig.groups.length][k].property + "><div>" + data[chartConfig.groups.length][k].data + "</div></th>";
        }
        html += colContent + "</tr></thead><tbody class='scrollContent'>";
        var headerLines = chartConfig.groups.length + 1;
        var dataPage = this.paginationProcessData(data, headerLines, pageDataNum);
        var colNum = data[0].length;
        var rowNum = colNum ? data.length - headerLines : 0;
        var trDom = this.render(dataPage[0], chartConfig, drill);
        html = html + trDom + "</tbody></table>";
        var optionDom = "<select><option value='10'>10</option><option value='20'>20</option><option value='50'>50</option><option value='100'>100</option><option value='150'>150</option></select>";
        var p_class = "p_" + random;
        var PaginationDom = "<div class='" + p_class + "'><div class='optionNum'><span>Show</span>" + optionDom + "<span>entries</span></div><div class='page'><ul></ul></div></div>";
        var operate = "<div class='toolbar toolbar" + random + "'><span class='info'><b>info: </b>" + rowNum + " x " + colNum + "</span>" +
            "<span class='exportBnt' title='export'></span></div>";
        $(container).html(operate);
        $(container).append("<div class='tableView table_" + random + "' style='width:99%;max-height:" + tall + "px;overflow:auto'>" + html + "</div>");
        $(container).append(PaginationDom);
        var self=this;
        $('.p_' + random).on('change', '.optionNum select', function (e) {
            var pageDataNum = e.target.value;
            var dataPage = self.paginationProcessData(data,headerLines, pageDataNum);
            var dom = $(e.target.offsetParent).find('.page>ul')[0];
            var tbody = $(e.target.offsetParent).find('tbody')[0];
            tbody.innerHTML = (self.render(dataPage[0], chartConfig, drill));
            var pageObj = {
                data: dataPage,
                chartConfig: chartConfig,
                drill: drill
            };
            self.renderPagination(dataPage.length, 1,pageObj, dom,random);
        });
        var pageObj = {
            data: dataPage,
            chartConfig: chartConfig,
            drill: drill
        };

        data.length ? this.renderPagination(dataPage.length, 1, pageObj, $('.' + p_class + ' .page>ul')[0],random) : null;
        this.export(random, data);
        // this.clickPageNum(dataPage, chartConfig, drill, p_class);
        // this.clickNextPrev(dataPage.length, pageObj, p_class);
        // this.selectDataNum(data, chartConfig.groups.length + 1, chartConfig, drill, p_class);
        // this.clickDrill("table_" + random, drill, args.render);
    },
    paginationProcessData: function (rawData, headerLines, pageSize) {
        pageSize=parseInt(pageSize);
        var dataLength = rawData.length - headerLines;
        var lastPageLines = dataLength % pageSize;
        var fullSizePages = parseInt(dataLength / pageSize);
        var totalPages;
        lastPageLines == 0 ? totalPages = fullSizePages : totalPages = fullSizePages + 1;
        var pageData = [];
        for (var currentPage = 1; currentPage < totalPages + 1; currentPage++) {
            var startRow = (currentPage - 1) * pageSize + headerLines;
            var partData = rawData.slice(startRow, startRow + pageSize);
            pageData.push(partData);
        }
        return pageData;
    },
    render: function (data, chartConfig, drill) {
        var html = '';
        if (data === undefined) {
            return html;
        }
        for (var r = 0; r < chartConfig.keys.length; r++) {
            for (var n = 1; n < data.length; n++) {
                var node = data[n][r].data;
                if (r > 0) {
                    var parent = data[n][r - 1].data;
                    var next;
                    n > 0 ? next = data[n - 1][r - 1].data : null;
                    (node == data[n - 1][r].data && parent == next) ? data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row_null',
                        property: data[n][r].property
                    } : data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row',
                        property: data[n][r].property
                    };
                }
                else if (r == 0) {
                    var preNode = n > 0 ? data[n - 1][r].data : null;
                    (node == preNode) ? data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row_null',
                        property: data[n][r].property
                    } : data[n][r] = {
                        data: data[n][r].data,
                        rowSpan: 'row',
                        property: data[n][r].property
                    };
                }
            }
        }
        for (var n = 0; n < data.length; n++) {
            var rowContent = "<tr>";
            var isFirstLine = (n == 0) ? true : false;
            for (var m = 0; m < chartConfig.keys.length; m++) {
                var currentCell = data[n][m];
                var rowParentCell = data[n][m - 1];
                var cur_data = currentCell.data ? currentCell.data : "";
                var keyId = chartConfig.keys[m].id;
                if (drill && drill.config[keyId] && (drill.config[keyId].down || drill.config[keyId].up)) {
                    var d = "";
                    if (drill.config[keyId].down) {
                        d += " drill-down='" + keyId + "' ";
                    }
                    if (drill.config[keyId].up) {
                        d += " drill-up='" + keyId + "' ";
                    }
                    cur_data = "<div class='table_drill_cell' " + d + ">" + cur_data + "</div>";
                }
                if (m > 0) {
                    if (currentCell.rowSpan == 'row_null' && rowParentCell.rowSpan == 'row_null' && !isFirstLine) {
                        rowContent += "<th class=row_null><div></div></th>";
                    } else {
                        rowContent += "<th class=row><div>" + cur_data + "</div></th>";
                    }
                } else {
                    if (currentCell.rowSpan == 'row_null' && !isFirstLine) {
                        rowContent += "<th class=row_null><div></div></th>";
                    } else {
                        rowContent += "<th class=row><div>" + cur_data + "</div></th>";
                    }
                }
            }
            for (var y = chartConfig.keys.length; y < data[n].length; y++) {
                rowContent += "<td class=" + data[n][m].property + "><div>" + data[n][y].data + "</div></td>";
            }
            html = html + rowContent + "</tr>";
        }
        return html;
    },
    renderPagination: function (pageCount, pageNumber, pageObj, target,random) {

        console.log("pageCount="+pageCount);
        var self=this;
        var liStr = '<li><a class="previewLink">Preview</a></li>';
        if (pageCount < 10) {
            for (var a = 0; a < pageCount; a++) {
                liStr += '<li><a class="pageLink">' + (a + 1) + '</a></li>';
            }
        }
        else {
            if (pageNumber < 6) {
                for (var a = 0; a < pageNumber + 2; a++) {
                    liStr += '<li><a class="pageLink">' + (a + 1) + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var i = pageCount - 2; i < pageCount; i++) {
                    liStr += '<li><a class="pageLink">' + (i + 1) + '</a></li>';
                }
            } else if (pageNumber <= (pageCount - 5)) {
                for (var c = 0; c < 2; c++) {
                    liStr += '<li><a class="pageLink">' + (c + 1) + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var j = pageNumber - 2; j < pageNumber + 3; j++) {
                    liStr += '<li><a class="pageLink">' + j + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var i = pageCount - 2; i < pageCount; i++) {
                    liStr += '<li><a class="pageLink">' + (i + 1) + '</a></li>';
                }
            } else {
                for (var c = 0; c < 2; c++) {
                    liStr += '<li><a class="pageLink">' + (c + 1) + '</a></li>';
                }
                liStr += '<li class="disable"><span class="ellipse">...</span></li>';
                for (var i = pageNumber - 2; i < pageCount + 1; i++) {
                    liStr += '<li><a class="pageLink">' + i + '</a></li>';
                }
            }
        }
        liStr += '<li><a class="nextLink">Next</a></li>';
        if (target) {
            target.innerHTML = liStr;
            if (pageNumber == 1) {
                target.childNodes[0].setAttribute('class', 'hide');
            } else if (pageNumber == pageCount) {
                target.childNodes[target.childNodes.length - 1].setAttribute('class', 'hide');
            }
            this.buttonColor(pageNumber, target);
        }
        /**
         * add by wanghaihua,单机页码触发的事件
         */

        $("a.pageLink",'.p_' + random).click(function (e) {
            e.stopPropagation();
            var pageNum = parseInt(e.target.innerText);
            self.clickPageSize(pageNum,e,pageCount,pageObj,target);
            self.renderPagination(pageCount, pageNum, pageObj, target,random);
        })
        $("a.nextLink",'.p_' + random).click(function (e) {
            e.stopPropagation();
            var currentNum=parseInt($("li a.current",target).text());
            self.clickPageSize(currentNum+1,e,pageCount,pageObj,target);
            self.renderPagination(pageCount, currentNum+1, pageObj, target,random);
        })
        $("a.previewLink",'.p_' + random).click(function (e) {
            e.stopPropagation();
            var currentNum=parseInt($("li a.current",target).text());
            self.clickPageSize(currentNum-1,e,pageCount,pageObj,target);
            self.renderPagination(pageCount, currentNum-1, pageObj, target,random);
        })
    },
    clickPageSize:function (pageNum,e,pageCount,pageObj,target){
        var dom = $(e.target.offsetParent).find('.page>ul')[0];
        var tbody = $(e.target.offsetParent).find('tbody')[0];
        tbody.innerHTML = this.render(pageObj.data[pageNum-1], pageObj.chartConfig, pageObj.drill);
        if (pageNum== 1) {
            target.childNodes[0].setAttribute('class', 'hide');
            target.childNodes[target.childNodes.length - 1].removeAttribute('class', 'hide');
        } else if (pageNum == pageCount) {
            target.childNodes[0].removeAttribute("class");
            target.childNodes[target.childNodes.length - 1].setAttribute('class', 'hide');
        }else{
            target.childNodes[0].removeAttribute("class");
            target.childNodes[target.childNodes.length - 1].removeAttribute("class");
        }
        this.buttonColor(pageNum, target);
    },
    buttonColor: function (pageNum, target) {
        $("li a.current",target).removeClass('current');
        if (target) {
            var buttons = target.childNodes;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].childNodes[0].innerText == pageNum ? $(buttons[i].childNodes[0]).addClass('current') : null;
            }
        }
    },
    export: function (random, data) {
        $(".toolbar" + random + " .exportBnt").on('click', function () {
            var xhr = new XMLHttpRequest();
            var formData = new FormData();
            formData.append('data', JSON.stringify({data: data, type: 'table'}));
            xhr.open('POST', 'dashboard/tableToxls.do');
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (e) {
                var blob = new Blob([this.response], {type: "application/vnd.ms-excel"});
                var objectUrl = URL.createObjectURL(blob);
                var aForExcel = $("<a><span class='forExcel'>下载excel</span></a>").attr("href", objectUrl);
                aForExcel.attr("download", "table.xls");
                $("body").append(aForExcel);
                $(".forExcel").click();
                aForExcel.remove();
            };
            xhr.send(formData);
        });

    }
};