/**
 * Created by wanghaihua on 2017/6/2
 */

cBoard.controller('path_analysisCtrl', function ($scope, $http, $q) {
    $scope.sankeyChart=function (data) {
        // var data={
        //     "nodes":[
        //         {"name":"Total"},
        //         {"name":"Environment"},
        //         {"name":"Land use"}
        //     ],
        //     "links":[
        //         {"source":"Total","target":"Environment","value":0.342284047256003},
        //         {"source":"Environment","target":"Land use","value":0.32322870366987}
        //     ]
        // }

        var myChart = echarts.init(document.getElementById("funnelChart"),"theme-fin1");
        option = {
            // title: {
            //     text: 'Sankey Diagram'
            // },
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            series: [
                {
                    type: 'sankey',
                    layout:'none',
                    data: data.nodes,
                    links: data.links,
                    itemStyle: {
                        normal: {
                            borderWidth: 1,
                            borderColor: '#aaa'
                        }
                    },
                    lineStyle: {
                        normal: {
                            curveness: 0.5
                        }
                    }
                }
            ]
        }
        myChart.setOption(option);
    }
    //时间插件
    $scope.date = {
        startDate: moment().subtract(7, "days"),
        endDate: moment().subtract(0, "days"),
    };
    $scope.date2 = {
        startDate: moment().subtract(1, "days"),
        endDate: moment()
    };

    $scope.opts = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "确定",
            fromLabel: "From",
            toLabel: "To",
            cancelLabel: '取消',
            customRangeLabel: '自定义日期范围',
            daysOfWeek: ["日","一","二","三","四","五","六"],
            firstDay: 1,
            monthNames: ["一月","二月","三月","四月","五月","六月","7月","八月","九月","十月","十一月","十二月"]
        },
        ranges: {
            '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '今天': [moment().subtract(0, 'days'), moment().subtract(0, 'days')],
            '过去7天': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
            // '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            '过去30天': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
            // '过去60天': [moment().subtract(60, 'days'), moment().subtract(1, 'days')]
        }
    };

    $scope.setStartDate = function () {
        $scope.date.startDate = moment().subtract(4, "days");
    };
    $scope.setRange = function () {
        $scope.date = {
            startDate: moment().subtract(5, "days"),
            endDate: moment()
        };
    };
    var getVideoName=function(englighName){
        switch(englighName){
            case "yinhe":
                return "爱奇艺"
                break;
            case "tencent":
                return "腾讯"
                break;
            default:
                return englighName;
        }

    }
    var getVideoEnglishName=function(data,index){
        if(data[index].value==null)
            return "未知";
        var videoName=data[index].value.split(",");
        var str=[];
        for(var i in videoName){
            str.push(getVideoName(videoName[i]));
        }
        return str.join(",");

    }
    var funnelNameList=function () {
        $http.post("dashboardfiguresec/getRouteAnalysisData.do").success(function (funnelNameListJson) {
            //debugger;
            var getJSON=function (data) {
                var mapData=[];
                for(var i in data){
                    var o={};
                    o.key=i;
                    o.value=data[i];
                    mapData.push(o);
                }
                return mapData.reverse();
            }
            $scope.funnelNameList=getJSON(funnelNameListJson.mapData);
            if($scope.funnelNameList.length>0)
                $scope.funnelNameList_value=$scope.funnelNameList[0].key+",0";
            $scope.mapVideo=getJSON(funnelNameListJson.mapVideo);
            $scope.puv=getJSON(funnelNameListJson.puv);
            $scope.videName=getVideoEnglishName($scope.mapVideo,0);
            $scope.pvAndUv=$scope.puv[0].value;
            // $scope.pvAndUv=$scope.puv[0].value
            $scope.initSankey();
        });

        // $http({
        //     method: 'post',
        //     url: 'dashboardfiguresec/getFunnelAnalysisData.do'
        // }).then(function (response) {
        //    debugger
        // }, function(response) {
        //   debugger
        // });

    }
    $scope.funnelNameChange=function (index) {
        $scope.videName=getVideoEnglishName($scope.mapVideo,$scope.funnelNameList_value.split(",")[1]);
        $scope.pvAndUv=$scope.puv[index].value;
    }
    funnelNameList();
    $scope.formatTen = function(num) {
        return num > 9 ? (num + "") : ("0" + num);
    }

    $scope.formatDate = function(date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        return year + "-" + $scope.formatTen(month) + "-" + $scope.formatTen(day);
    }

    //接口
    $scope.initSankey=function () {
        var requestParam={};
        requestParam.pk_funnel_path=$scope.funnelNameList_value.split(",")[0];
        requestParam.start_time=$scope.formatDate((new Date($scope.date.startDate._d)));
        requestParam.end_time=$scope.formatDate((new Date($scope.date.endDate._d)));
        $http.post("dashboardfiguresec/getpathdatas.do",requestParam).success(function (data) {
            if(parseInt(data.msg)==1){
                if(data.links.length==0){
                    alert("没有数据");
                    return;
                }
                data.links=_.map(data.links,function (num) {
                    return {
                        source:num.source,
                        target:num.target,
                        value:parseInt(num.val)
                    }
                })
                $scope.sankeyChart(data);

            }else{
                alert(data.errorMsg);
            }
        })
    }

    $scope.getSankey=function () {
        $scope.initSankey();
    }
});/**
 * Created by wanghaihua on 2017/6/19.
 */
