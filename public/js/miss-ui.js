/// <reference path="D:/Miss/i9/wwwroot/js/jquery.d.ts" />
/// <reference path="D:/Miss/i9/wwwroot/js/miss-ui.d.ts" />
(function () {
    //检查当前浏览器是否支持 Miss-ui
    if (!window.__lookupGetter__ || navigator.userAgent.toLowerCase().indexOf(" trident/") > 0) {
        window.location = '/html/notsupported.html';
    }

    //Domain
    try { if (location.href.toLowerCase().indexOf('.simon.com.cn') > 0) window.document.domain = "simon.com.cn"; } catch (ex) { }

    try {
        if (!window.top._i9DialogscrollEvent) window.top._i9DialogscrollEvent = function () {
            if (window.top._i9DialogStartscrollTop) $(window.top.document).scrollTop(window.top._i9DialogStartscrollTop);
            if (window.top._i9DialogStartscrollLeft) $(window.top.document).scrollLeft(window.top._i9DialogStartscrollLeft);
        };
        if (!window.top._i9DialogmousewheelEvent) window.top._i9DialogmousewheelEvent = function (event) {
            event.preventDefault();
            return false;
        };
        //注入Landray页面脚本和样式
        if (window.location.host.substr(0, 3) !== 'e9.' && (window.top.location.host.substr(0, 3) === 'e9.' || window.top.location.host.substr(0, 4) === 'e9t.') && !window.top.landraySubmitBpmToi9) {

            $('#theme-css').remove();

            var fix = $('#script_miss_ui').attr('src') || '';
            fix = fix.substr(fix.indexOf('?'));
            if (!fix) fix = "?v=" + Math.random();

            var head = window.top.document.getElementsByTagName('head')[0];

            if (!window.top.jQuery) {
                var inJQuery = document.createElement('script');
                inJQuery.src = 'https://e9.simon.com.cn/resource/js/jquery.js';
                inJQuery.type = 'text/javascript';
                head.appendChild(inJQuery);
            }

            var inSvgIcon = document.createElement('script');
            inSvgIcon.src = 'https://i9c.simon.com.cn/js/svgicon.js' + fix;
            inSvgIcon.type = 'text/javascript';
            head.appendChild(inSvgIcon);

            var inScript = document.createElement('script');
            inScript.src = 'https://i9c.simon.com.cn/js/miss-ui.js' + fix;
            inScript.type = 'text/javascript';
            head.appendChild(inScript);

            var inLink = document.createElement('link');
            inLink.href = 'https://i9c.simon.com.cn/css/miss-ui.css' + fix;
            inLink.rel = "stylesheet";
            inLink.type = 'text/css';
            head.appendChild(inLink);

            var inStyle = document.createElement('style');
            inStyle.type = 'text/css';
            inStyle.innerHTML = '* { box-sizing: content-box; -moz-box-sizing: content-box; -webkit-box-sizing: content-box; }\n'
                + '.dialogDiv,.dialogDiv *,.btn-group-wrap *,.childpicker-wrap, .childpicker-wrap *,.childpicker-wrap-time, .childpicker-wrap-time *,.ictr-wrap,.ictr-wrap * { box-sizing: border-box !important; -moz-box-sizing: border-box !important; -webkit-box-sizing: border-box !important; }\n'
            head.appendChild(inStyle);
        }
    }
    catch (ex) {
        console.warn('跨域访问错误, cross-origin error.');
    }
})();

/** Landray审批时提交按钮i9检验 (返回 true:继续执行，false:中断) 
 * 请在页面中重写landraySubmitButtonValidate()
 * -----------------------------------------------
 * openConfirm用法：
 * openConfirm('您确认要提交吗', function (ret) {
 *     if (ret) ictr.ReSubmitLandrayBpm();
 * });
 * return false;
 */
var landraySubmitButtonValidate = function () { return true; }
var landraySubmitBpmToi9 = function () {
    if (_miss_fun._hasAjaxRequest && window.parent && window.parent.Com_Parameter) {
        //e9环境
        $.WhenAjaxDone(function () {
            window.parent.document.getElementById('process_review_button').click();
        }, 100);
        return false;
    }
    if (_miss_fun.isPauseValidateLandrayBpm) return true;
    var ret = landraySubmitButtonValidate();
    if (ret === undefined) return true;
    return !!ret;
};

/**-- $ctr.xxx() -----------------------*/
(function ($) {

    //-- 基本功能-----------------------------------------------------------------------------------

    $.fn.AfterChange = function (fun) { return $(this).on("AfterChange", fun); };
    $.fn.PageSuited = function (fun) { return $(this).on("PageSuited", fun); };

    $.fn.parentUntil = function (predicateFun, maxStack) {
        var $this = $(this);
        maxStack = maxStack || 50;
        if (predicateFun($this)) return $this;

        for (var i = 0; i < maxStack; i++) {
            $this = $this.parent();
            if ($this.length == 0) return $this;
            if (predicateFun($this)) return $this;
        }
        return $(null);
    };

    //赋值取值
    $.fn.ival = function (value) {
        var $this = $(this);
        if ($this.length === 0) return $this;
        var ctrtype = ($this.attr('ctrtype') || '').toLowerCase();
        if (arguments.length === 0) //取值
        {
            var val;
            switch (ctrtype) {
                case 'itext':
                    var NameType = $this.attr('tonametype');
                    if (NameType && NameType !== 'none') {
                        return $this.find('input[type]').attr('code') || '';
                    }
                    if ($this.attr('texttype') === 'editor') {
                        $this.find('>div.ieditor-body img').removeAttr('data-mce-src');
                        return $.optimizeWhiteSpace($this.find('>div.ieditor-body').html());
                    }
                    else if ($this.attr('texttype') === 'markdown') {
                        var editorId = $this.attr('_Code_Editor_InstanceID');
                        if (editorId && window[editorId]) {
                            var mdInstance = window[editorId];
                            if (!mdInstance.cm) return null;
                            return { md: $.optimizeWhiteSpace(window[editorId].getMarkdown()), html: $.optimizeWhiteSpace(window[editorId].getPreviewedHTML()) };
                        }
                        else
                            return null;
                    }
                    else if ($this.attr('texttype') === 'code') {
                        var editorId = $this.attr('_Code_Editor_InstanceID');
                        if (editorId && window[editorId])
                            return $.optimizeWhiteSpace(window[editorId].getValue());
                        else
                            return null;
                    }
                    else if ($this.find('input').length > 0) {
                        var Type = $this.attr('texttype');
                        val = $.trim($.optimizeWhiteSpace($this.find('input').val()));
                        if (!val) return '';
                        if (Type === "integer" || Type === "decimal" || Type === "percent") {
                            val = val.replace(/,/g, '').replace(/ /g, "");
                            if (Type === "percent" && val) {
                                if (($this.attr('formatstr') || '').indexOf('%') >= 0)
                                    return $.optimizeNumber(val) + '%';
                                else
                                    return $.optimizeNumber(parseFloat(val.toString()) / 100);
                            }
                        }
                        if (Type === "datetime" && val.indexOf('T') > 0) val = val.replace('T', ' ').substr(0, 16);
                        return val;
                    }
                    else if ($this.find('textarea').length > 0) {
                        return $.optimizeWhiteSpace($this.find('textarea').val());
                    }
                    else {
                        return $.optimizeWhiteSpace($this.html());
                    }
                case 'icalendar':
                    return $.optimizeWhiteSpace($this.attr('value') || '');
                case 'iselect':
                    return $.optimizeWhiteSpace($this.attr('key') || '');
                case 'icheckbox':
                    if ($this.attr('checkboxtype') == 'checkbox') {
                        var chks = [];
                        $this.find('input').each(function (index) {
                            if ($(this).prop('checked') === true)
                                chks.push(1);
                            else
                                chks.push(0);
                        });
                        return chks;
                    } else if ($this.attr('checkboxtype') === 'radio') {
                        var currindex = '';
                        $this.find('input').each(function (index) {
                            if ($(this).prop('checked') === true) {
                                currindex = index;
                                return;
                            }
                        });
                        return currindex;
                    }
                    else if ($this.attr('checkboxtype') === 'slide')
                        return $this.prop('checked');
                    else
                        return $this.find('input').prop('checked');
                case 'ireference':
                    return $.optimizeWhiteSpace($this.attr('key') || '');
                case 'ilist':
                    var lst = [];
                    $this.find('span.listitem').each(function () {
                        lst.push($.trim($(this).text()));
                    });
                    return lst.join(',');
                case 'igridview':
                    return $.optimizeWhiteSpace($this.find('.tbody>tbody>tr[activated="true"]:first').attr('keyvalue') || '');
                case 'ilabel':
                    return $.optimizeWhiteSpace($this.text());
                case 'ibutton':
                    return $.optimizeWhiteSpace($this.find('.buttontitle').text());
                case 'igrouplabel':
                    return $.optimizeWhiteSpace($this.find('>span').text());
                case 'iattachment':
                    return $this.find('.imgItem,a').length;
                case 'itabs':
                    var $ul = $this.find('.header>ul');
                    var $selectedli = $ul.find('li[selected]');
                    return $ul.find('li').index($selectedli);
                case 'islidebar':
                    val = $this.attr('val') || '';
                    return val.indexOf('%') > 0 ? val : parseInt(val);
                case 'ibarcode':
                    return $this.attr('barcode') || '';
                case 'ilocation':
                    return $.JsonObject($this.attr('jsonvalue') || '');
                case 'itree':
                    return $this.find('.iTreeTitleDV[selected="selected"]').parent().parent().attr('keyvalue') || '';
                default:
                    var cType = $this[0].tagName.toLowerCase();
                    if (cType === "input") {
                        var inputType = $this.attr('type');
                        if (inputType === "checkbox" || inputType === "radio") return $this.prop('checked');
                        return $this.val();
                    }
                    else if (cType === "select" || cType === "textarea")
                        return $.optimizeWhiteSpace($this.val());
                    else
                        return $.optimizeWhiteSpace($this.text());
            }
        } else //赋值
        {
            if (value === null || value === undefined) value = "";
            //值一样的话，无须赋值
            var thisval = $this.ival();
            if ($.toJsonString(thisval) === $.toJsonString(value)) return $this;
            if (thisval && value && thisval.constructor === Array && value.constructor === Array && JSON.stringify(thisval) == JSON.stringify(value)) return $this;
            switch (ctrtype) {
                case 'itext':
                    value = $.toJsonString(value);
                    $this.iTextSetValue(value);
                    break;
                case 'icalendar':
                    $this.attr('value', value).iCalendar();
                case 'iselect':
                    $this.iSelectSetKey(value);
                    break;
                case 'icheckbox':
                    var checkboxtype = $this.attr('checkboxtype');
                    if (checkboxtype === 'slide') {
                        if ($.isTrue(value)) {
                            $this.prop('checked', true);
                            $this.prev().addClass('on');
                        } else {
                            $this.prop('checked', false);
                            $this.prev().removeClass('on');
                        }
                    } else if (checkboxtype === 'checkbox') {
                        var chkJo = $.JsonObject(value);
                        for (var i = 0; i < chkJo.length; i++) {
                            var $input = $this.find('input:eq("' + i + '")').prop('checked', chkJo[i] === 1);
                            if ($input.prop('checked')) {
                                $input.parent().addClass('checked');
                            }
                            else {
                                $input.parent().removeClass('checked');
                            }
                        }
                    } else if (checkboxtype === 'radio') {
                        $this.find('input').prop('checked', false);
                        $this.find('input:eq("' + value + '")').prop('checked', true);
                        $this.find('>label>input').each(function () {
                            var $input = $(this);
                            if ($input.prop('checked')) {
                                $input.parent().addClass('checked');
                            }
                            else {
                                $input.parent().removeClass('checked');
                            }
                        });
                    } else {
                        if ($.isTrue(value))
                            $this.find('input').prop('checked', true);
                        else
                            $this.find('input').prop('checked', false);
                    }
                    _miss_fun.triggerAfterChange($this); //触发AfterChange事件
                    break;
                case 'ireference':
                    $this.iReferenceSetValue(value, '#key#', false);
                    break;
                case 'ilist':
                    var vals = $.trim(value).replace(/\r\n/g, ',').replace(/\n/g, ',').split(',');
                    var lst = '';
                    for (var i = 0; i < vals.length; i++) {
                        var s = $.trim(vals[i]);
                        if (!s) continue;
                        var dlg = '';
                        if ($this.attr('rawdlgurl')) {
                            dlg = ' dlgwidth="' + $this.attr('rawdlgwidth') + '" dlgheight="' + ($this.attr('rawdlgheight') || '')
                                + '" dlgurl="' + EncodeHtml(($this.attr('rawdlgurl') || '').replace("#value#", s)) + '"';
                        }
                        lst += '<span class="listitem"' + dlg + '>' + EncodeHtml(s) + '</span>';
                    }
                    $this.find('>div.ictr-input').html(lst);
                    _miss_fun.triggerAfterChange($this); //event
                    break;
                case 'ilabel':
                    $this.iLabelSetValue(value);//text(value);
                    break;
                case 'ibutton':
                    $this.find('.buttontitle').text(value);
                    break;
                case 'igrouplabel':
                    $this.find('>span').text(value);
                    break;
                case 'itabs':
                    $this.iTabs(value);
                    break;
                case 'islidebar':
                    var $block = $this.find('.slidebar-block');
                    var $leftbar = $this.find('.slidebar-left');
                    var width = $this.width();
                    var min = $this.attr('min');
                    var max = $this.attr('max');
                    var x;
                    if (!min && !max) {
                        //precent
                        if (value == null) value = 0;
                        if (value.constructor === String) {
                            if (value.indexOf('%') > 0)
                                value = parseFloat(value.replace("%", '')) / 100;
                            else
                                value = Math.abs(parseFloat(value)) > 1 ? (parseFloat(value) / 100) : parseFloat(value);
                        }
                        value = Math.floor(value * 100) + '%';
                        x = value;
                    }
                    else {
                        //min - max
                        min = parseInt(min || 0);
                        max = parseInt(max || 100);
                        if (value < min) value = min;
                        if (value > max) value = max;
                        x = (value - min) / (max - min);
                    }
                    if (x < 0) x = 0;
                    if (x > 1) x = 1;

                    $this.attr('val', value);
                    $block.css('left', x * width / (width + 4) * 100 + "%").attr('title', value);
                    $leftbar.css('width', x == 0 ? '1px' : (x * 100 + '%'));

                    _miss_fun.triggerAfterChange($this); //event
                    break;
                case 'ibarcode':
                    $this.attr('barcode', value);
                    var bcFormat = $this.attr('format') || '';
                    svr.getBarCodeImgData(value, bcFormat, function (ret) {
                        var $bcImg = $this.find('>img');
                        if ($bcImg.length == 1)
                            $bcImg.attr('src', ret);
                        else
                            $this.attr('img', ret);
                    });
                    break;
                case 'ilocation':
                    $this.attr('jsonvalue', $.toJsonString(value));
                    var jo = $.JsonObject(value);
                    if (jo && (jo.actual || jo.poi)) {
                        if (jo.actual) {
                            $this.find('.locname').text(jo.actual['name'] || '未获取到定位信息');
                            $this.find('.locaddr').text(jo.actual['addr'] || '');
                        }
                        else {
                            $this.find('.locname').text(jo.poi['name'] || '未获取到定位信息');
                            $this.find('.locaddr').text(jo.poi['addr'] || '');
                        }
                    }
                    _miss_fun.triggerAfterChange($this); //event
                    break;
                default:
                    var cType = $this[0].tagName.toLowerCase();
                    if (cType === "input") {
                        var inputType = $this.attr('type');
                        if (inputType === "checkbox" || inputType === "radio")
                            $this.prop('checked', value);
                        else
                            $this.val(value);
                        _miss_fun.triggerAfterChange($this); //触发AfterChange事件
                    }
                    else if (cType === "select" || cType === "textarea") {
                        $this.val(value);
                        _miss_fun.triggerAfterChange($this); //触发AfterChange事件
                    } else {
                        $this.text(value);
                    }
                    break;
            }
            return $this;
        }
    };

    //获取或设置控件disabled
    $.fn.iDisabled = function (isDisabled) {
        var $this = $(this);
        var id = $this.attr('id') || '';
        var ctrtype = ($this.attr('ctrtype') || '').toLowerCase();
        if ($this.length === 0) return;
        if ($this.length > 1) {
            $this.each(function () {
                $(this).iDisabled(isDisabled);
            });
            return;
        }
        else if (ctrtype === '') {
            $this.find('[BindField], div[ctrtype="iAttachment"], div[ctrtype="iGridView"]').each(function () {
                $(this).iDisabled(isDisabled);
            });
            return;
        }

        if (arguments.length === 0) //取值
        {
            var da;
            switch (ctrtype) {
                case 'itext':
                case 'iselect':
                case 'ireference':
                case 'iattachment':
                case 'icheckbox':
                case 'ibuttom':
                case 'ilocation':
                    da = $this.attr('isdisabled');
                    break;
                default:
                    da = $this.attr('disabled');
            }
            return da === 'true' || da === 'disabled';
        }

        //赋值 false
        if (!isDisabled || isDisabled === "0" || isDisabled.toString().toLowerCase() === "false") {
            switch (ctrtype) {
                case 'itext':
                    $this.attr('isdisabled', 'false');
                    if ($this.attr('texttype') === 'editor') {
                        var editorInstance = tinymce.get(id + '_body');
                        if (editorInstance) editorInstance.mode.set('design');
                    }
                    else if ($this.attr('texttype') === 'markdown') {

                    }
                    else if ($this.attr('texttype') === 'code') {
                        var editorId = $this.attr('_Code_Editor_InstanceID');
                        if (editorId && window[editorId]) {
                            window[editorId].setOption('readOnly', false);
                        }
                    }
                    else {
                        $this.find('input[type="text"]').removeAttr('disabled');
                        $this.find('textarea').removeAttr('disabled');
                        $this.find('.righticon').removeAttr('disabled');
                    }
                    break;
                case 'iselect':
                case 'ilocation':
                    $this.attr('isdisabled', 'false');
                    $this.find('input[type="text"]').removeAttr('disabled');
                    $this.find('.righticon').removeAttr('disabled');
                    if (ctrtype == 'iselect') $this.iSelect();
                    break;
                case 'ireference':
                    $this.attr('isdisabled', 'false');
                    $this.find('input[type="text"]').removeAttr('disabled');
                    if ($this.attr('buttondisabled') !== 'true') $this.find('.righticon').removeAttr('disabled');
                    break;
                case 'icheckbox':
                    $this.attr('isdisabled', 'false');
                    $this.find('input').removeAttr('disabled');
                    $this.find('label').removeAttr('disabled');
                    $this.removeAttr('disabled');
                    var thisid = $this.attr('id');
                    if (thisid) {
                        var $thislabel = $this.parent().find('>label[for="' + thisid + '"]');
                        if ($thislabel.length == 1) $thislabel.attr('isdisabled', 'false');
                    }
                    break;
                case 'iattachment':
                    $this.attr('isdisabled', 'false');
                    $this.find('.righticon').removeAttr('disabled').css({ color: '#999', cursor: 'pointer' });
                    $this.iAttLoadList();
                    break;
                case 'ibutton':
                    $this.attr('isdisabled', 'false');
                    $this.removeAttr('disabled');
                    $this.parent().find('button').removeAttr('disabled');
                    _miss_fun.iButtonSetParentMenuStatus($this, false);
                    break;
                case 'igridview':
                    var initeditmode = $this.attr('initeditmode');
                    if (initeditmode !== 'none') {
                        $this.find('.dpager').outerHeight(29);
                        if (initeditmode == "all") {
                            $this.find('.dpager>.AddRow').show();
                            $this.find('.dpager>.InsertRow').show();
                            $this.find('.dpager>.DeleteRow').show();
                        }
                        $this.find('.dpager>.BatchEdit').show();
                        $this.attr('editmode', initeditmode);
                    }
                    break;

                default:
                    $this.removeAttr("disabled").removeAttr("isdisabled");
            }
        }
        else { //赋值 true
            switch (ctrtype) {
                case 'itext':
                    $this.attr('isdisabled', 'true');
                    if ($this.attr('texttype') === 'editor') {
                        var editorInstance = tinymce.get(id + '_body');
                        if (editorInstance) editorInstance.mode.set('readonly')
                    }
                    else if ($this.attr('texttype') === 'markdown') {

                    }
                    else if ($this.attr('texttype') === 'code') {
                        var editorId = $this.attr('_Code_Editor_InstanceID');
                        if (editorId && window[editorId]) {
                            window[editorId].setOption('readOnly', true);
                        }
                    }
                    else {
                        $this.find('input[type="text"]').attr('disabled', 'disabled');
                        $this.find('textarea').attr('disabled', 'disabled');
                        $this.find('.righticon').attr('disabled', 'disabled');
                    }
                    break;
                case 'iselect':
                case 'ireference':
                case 'ilocation':
                    $this.attr('isdisabled', 'true');
                    $this.find('input[type="text"]').attr('disabled', 'disabled');
                    $this.find('.righticon').attr('disabled', 'disabled');
                    if (ctrtype == 'iselect') $this.iSelect();
                    break;
                case 'icheckbox':
                    $this.attr('isdisabled', 'true');
                    $this.find('input').attr('disabled', 'disabled');
                    $this.find('label').attr('disabled', 'disabled');
                    $this.attr('disabled', 'disabled');
                    var thisid = $this.attr('id');
                    if (thisid) {
                        var $thislabel = $this.parent().find('>label[for="' + thisid + '"]');
                        if ($thislabel.length == 1) $thislabel.attr('isdisabled', 'true');
                    }
                    break;
                case 'iattachment':
                    $this.attr('isdisabled', 'true');
                    $this.find('.righticon').attr('disabled', 'disabled').css({ color: '#ddd', cursor: 'not-allowed' });
                    $this.iAttLoadList();
                    break;
                case 'ibutton':
                    $this.attr('isdisabled', 'true');
                    $this.attr('disabled', 'disabled');
                    $this.parent().find('button').attr('disabled', 'disabled');
                    _miss_fun.iButtonSetParentMenuStatus($this, true);
                    break;
                case 'igridview':
                    if ($this.attr('editmode') !== 'none') {
                        $this.attr('initeditmode', $this.attr('editmode'));
                        $this.find('.dpager').outerHeight(29);
                        $this.find('.dpager>.AddRow').hide();
                        $this.find('.dpager>.InsertRow').hide();
                        $this.find('.dpager>.DeleteRow').hide();
                        $this.find('.dpager>.BatchEdit').hide();
                        $this.find('.dpager>.BatchImport').hide();

                        $this.attr('editmode', 'none');
                    }
                    break;
                case 'ilabel':
                case 'iicon':
                    break;
                default:
                    $this.attr('isdisabled', 'true').attr('disabled', 'disabled');
            }
        }
        return $this;
    };

    //激活控件
    $.fn.iControls = function () {
        var $this = $(this);
        var ctrtype = ($this.attr('ctrtype') || '').toLowerCase();
        if ($this.length === 0) return $this;
        if ($this.length > 1) {
            $this.each(function () { $(this).iControls(); });
            return $this;
        } else if (ctrtype === '') {
            $this.find('[ctrtype]').each(function () { $(this).iControls(); });
            $this.find('[menus]').each(function () { $(this).iMenus(); });
            $this.find(':checkbox').iCheckBox();
            $this.find('div.grail-cell').each(function () {
                var $dv = $(this);
                var g = ($dv.attr('grail') + ",0,0,0").split(',');
                var l, r;
                if (parseInt($.trim(g[0])) > 0) {
                    l = parseInt($.trim(g[0]));
                    r = parseInt($.trim(g[2]));
                }
                else {
                    l = 0;
                    r = parseInt($.trim(g[1]));
                }
                if (l > 0) {
                    $dv.find('>*:first').addClass('left').css({ 'margin-left': (2 - l) + 'px', 'width': (l - 14) + 'px' });
                    $dv.find('>*:eq(1)').addClass('content');
                    if (r > 0) $dv.find('>*:eq(2)').addClass('right').css({ 'margin-right': (2 - r) + 'px', 'width': (r - 8) + 'px' });
                }
                else if (r > 0) {
                    $dv.find('>*:first').addClass('content');
                    $dv.find('>*:eq(1)').addClass('right').css({ 'margin-right': (2 - r) + 'px', 'width': (r - 14) + 'px' });
                }
            });
            return;
        }
        switch (ctrtype) {
            case 'itext':
                var texttype = $this.attr('texttype');
                if (texttype === 'editor' || texttype === 'markdown' || texttype === 'code')
                    $this.iCode();
                else if (texttype === 'textarea' && $this.attr('isdisabled') === 'true' && $this.attr('AutoHeight') === 'true') {
                    $this[0].style.height = '2px';
                    var h = $this[0].scrollHeight;
                    if (h < 21) h = 21;
                    $this[0].style.height = h + 'px';
                    $this.css('height', 'auto');
                }
                break;
            case 'iselect':
                $this.iSelect();
                break;
            case 'iattachment':
                $this.iAttLoadList();
                break;
            case 'itabs':
                $this.iTabs($this.ival(), true);
                break;
            case 'islidebar':
                $this.ival($this.attr('val') || '');
                break;
            case 'icalendar':
                $this.iCalendar();
                break;
            case 'ichart':
                $this.iChart();
                break;
        }
        return $this;
    };

    //设置或取消按钮图标为 正在运行（旋转的小图标）
    $.fn.iButtonSetRunning = function (isRunning) {
        $this = $(this);
        if ($this.find('.xiconfont').length == 0) return;
        if (isRunning)
            $this.find('.xiconfont').addClass('spin-xicon1');
        else
            $this.find('.xiconfont').removeClass('spin-xicon1');
    }

    //将控件转化为Label
    $.fn.iLabel = function () {
        var $this = $(this);
        if ($this.length === 0) return;
        var ctrtype = ($this.attr('ctrtype') || '').toLowerCase();
        if ($this.length > 1) {
            $this.each(function () { $(this).iLabel(); });
            return;
        }
        else if (ctrtype === '') {
            $(this).find('[$ctrtype]').each(function () { $(this).iLabel(); });
            return;
        }

        var ShowText = "";
        switch (ctrtype) {
            case 'itext':
                ShowText = $this.ival();
                $this.addClass('showaslabel').html(ShowText);
                break;
            case 'iselect':
                ShowText = $this.attr('desc') || '';
                ShowText = EncodeHtml(ShowText);
                $this.addClass('showaslabel').html(ShowText);
                $this.attr('title', ($this.attr('code') || '') + "\r\n" + ShowText);
                break;
            case 'icheckbox':
                this.iDisabled(true);
                break;
            case 'ireference':
                if (this.attr('showText') === 'true') {
                    ShowText = $this.attr('desc') || '';
                } else {
                    ShowText = $this.attr('Code') || '';
                }
                $this.addClass('showaslabel').html(ShowText);
                $this.attr('title', ($this.attr('code') || '') + "\r\n" + ShowText);
                break;
            case 'iattachment':
                $this.attr('allowupload', 'false');
                $this.attr('allowdelete', 'false');
                $this.find('.righticon ').remove();
                $this.iAttLoadList();
                break;
            case 'inote':
                $this.attr('TextReadOnly', 'true');
                $this.attr('CanEdit', 'false');
                $this.attr('CanDelete', 'false');
                $this.iNote();
                break;
            case 'igridview':
                $this.find('.dpager').outerHeight(29);
                $this.find('.dpager>.AddRow').remove();
                $this.find('.dpager>.InsertRow').remove();
                $this.find('.dpager>.DeleteRow').remove();
                $this.find('.dpager>.BatchEdit').remove();
                $this.attr('editmode', 'none');

                var $table = $this.find(".tbody");
                $table.find('>tbody>tr').each(function () {
                    var $tr = $(this);
                    $tr.find('>td').unbind('click').unbind('keydown');
                });
                break;
        }
    };

    //全屏切换
    $.fn.iFullform = function () {
        var $this = $(this);
        var $frm = $(window.frameElement);
        if ($this.hasClass('dvFullForm')) {
            if ($frm.length > 0 && $frm.attr('ForDialog')) {
                $frm.parent().parent().removeClass('FullForm');
            }
            $('.dvFullForm').removeClass('dvFullForm');
        }
        else {
            if ($frm.length > 0 && $frm.attr('ForDialog')) {
                $frm.parent().parent().addClass('FullForm');
            }
            $this.addClass('dvFullForm');
        }
        $this.iCtrSetHeight();
        return $this;
    };

    //上标信息
    $.fn.iBadge = function (val) {
        var $wrap = $(this);
        var $sup = $wrap.find('>sup.ibadge');
        if (!val) {
            $sup.remove();
            return;
        }
        if ($sup.length == 0) {
            if ($wrap.css('position') === "static") $wrap.css('position', 'relative');
            if ($wrap.css('overflow') === "hidden") $wrap.css('overflow', 'visible');
            if (val === 'reddot') {
                $sup = $('<sup class="ibadge reddot">&nbsp;</sup>');
            }
            else {
                $sup = $('<sup class="ibadge">' + val + '</sup>');
            }
            $wrap.append($sup);
        }
        else {
            if (val === 'reddot')
                $sup.addClass('reddot').html('&nbsp;');
            else
                $sup.text(val)
        }
        return $wrap;
    }

    $.fn.iCalendar = function () {
        var $this = $(this);
        $(document).ready(function () {
            _miss_fun.iTextDatePicker($this);
        });
    }

    $.fn.iChart = function (options) {
        var $this = $(this);
        var id = $this.attr('id') || '';

        var chartInstance = window['iChartInstance_' + id];
        if (!chartInstance) {
            var theme = $this.attr('theme') || '';
            window['iChartInstance_' + id] = chartInstance = echarts.init($this[0], theme);
            var _LastResizeTime = null;
            $(window).resize(function () {
                if (_LastResizeTime) clearTimeout(_LastResizeTime);
                _LastResizeTime = setTimeout(function () { chartInstance.resize(); }, 300);
            });
        }

        if (options) {
            setTimeout(function () {
                chartInstance.setOption(options);
                chartInstance.resize();
            }, 300);
        }
        return chartInstance;
    }

    //-- iReport --------------------------------------------------------------------------------

    $.fn.iReport = function (QueryMode, callback) {
        //iReport 查询模式：show, auto, exportHtml, exportXLS, exportPDF, save, history, print, printauto, template, page
        var $wrap = $(this);

        if (QueryMode) {
            if (QueryMode.constructor === Function) {
                callback = QueryMode;
                QueryMode = "show";
            }
            else if (QueryMode.constructor === Object || $.trim(QueryMode).substr(0, 1) == "{") {
                $wrap.attr('QueryArgs', $.trim($.toJsonString(QueryMode)));
                QueryMode = "show";
            }
        }
        if (!QueryMode) QueryMode = "show";

        if (QueryMode != 'page') $wrap.attr('PageNo', '1');

        if (!$wrap.attr('HistoryID') && (QueryMode === 'save' || QueryMode === 'exportXLS' || QueryMode === 'exportHtml' || QueryMode === 'exportPDF')) {
            openAlert(lang('请查询后再执行该操作。', 'Please launch the report first.'));
            return $wrap;
        }

        var ctrID = $wrap.attr('id') || '';

        $wrap.attr('isloaded', 'start');

        //显示 loading
        if ($wrap.css('display') == 'none') {
            var loadingTop = (innerHeight - 40) / 2;
            var loadingLeft = (innerWidth - 30) / 2;
            $('body').find('.iGridViewLoading').remove();
            $('body').append($('<div class="iGridViewLoading" style="position:absolute;"></div>').offset({ top: loadingTop, left: loadingLeft }));
        }
        else {
            var loadingTop = ($wrap.outerHeight() - 40) / 2;
            var loadingLeft = ($wrap.outerWidth() - 30) / 2;
            $wrap.find('.iGridViewLoading').remove();
            $wrap.append($('<div class="iGridViewLoading"></div>').offset({ top: loadingTop, left: loadingLeft }));
        }

        //触发BeforeGetData事件
        $wrap.triggerHandler("BeforeGetData");
        $.each(ictr._rundata_.irptBeforeGetData, function () { this($wrap, ctrID); });

        var asyncmode = $wrap.attr('asyncmode') || "true";

        var ReportKey = $wrap.iGridViewGetGridKey();

        var ReportArgs = {
            ctrID: ctrID,
            ReportKey: ReportKey,
            QueryArgs: $wrap.attr('QueryArgs') || "",
            SaveArgs: $wrap.attr('SaveArgs') || "",
            HistoryID: $wrap.attr('HistoryID') || "0",
            PageInfo: $wrap.attr('PageInfo') || "",
            PageNo: $wrap.attr('PageNo') || '1',
            asyncmode: asyncmode,
            ExtAttr: $wrap.attr('ExtAttr') || '',
            freezerows: $wrap.attr('freezerows') || '0',
            freezecols: $wrap.attr('freezecols') || '0',
            QueryMode: QueryMode,
            action: svr._currentAssembly,
            lt: $wrap.attr('lt') || ''
        };

        var $dbody = $wrap.find('.dbody');

        var url = "/api/icontrols/iReportData/GetData";
        var jqXhr = $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            timeout: 7200000,
            url: url,
            data: { ReportArgs: $.toJsonString(ReportArgs) }
        }).done(function (ret) {

            if (QueryMode === "show" || QueryMode === "auto") $.SetRemoteData("/api/common/setReportRead?key=" + encodeURIComponent(ReportKey) + "&flag=r");

            $wrap.attr('isloaded', 'true');

            if (isError(ret)) {
                openAlert(ret);
                //移除 loading
                if ($wrap.css('display') == 'none')
                    $('body').find('.iGridViewLoading').remove();//移除 loading
                else
                    $wrap.find('.iGridViewLoading').remove();//移除 loading
                $wrap.attr('isloaded', 'false');

                if (callback) callback(null);
                //svr.Log('iReport查询出错:' + ReportKey, ret); //写入日志
                return;
            }

            var result = $.JsonObject(ret);
            //导出
            if (QueryMode === 'exportXLS' || QueryMode === 'exportHtml' || QueryMode === 'exportPDF') {

                if (result.Body === "ok")
                    _miss_fun.iGridViewExportExcel($wrap);
                else {
                    openAlert(lang('请先运行报表，再尝试导出。', 'Please run the report first, and then try the export.'));
                    if ($wrap.css('display') == 'none')
                        $('body').find('.iGridViewLoading').remove();//移除 loading
                    else
                        $wrap.find('.iGridViewLoading').remove();//移除 loading
                }
                return;
            }
            else if (QueryMode === "print" || QueryMode === "printauto") {
                if ($wrap.css('display') == 'none')
                    $('body').find('.iGridViewLoading').remove();//移除 loading
                else
                    $wrap.find('.iGridViewLoading').remove();//移除 loading

                //触发OnLoaded事件
                $wrap.triggerHandler("OnLoaded", result);
                $.each(ictr._rundata_.irptLoaded, function () { this(result, $wrap, result); });
                //回调函数
                if (callback) callback(result, $wrap, result);

                var downloadUrl = "/expfiles/A" + $.formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss') + ".pdf";
                openDialog(downloadUrl, { width: 800, height: 800, title: 'Print Preview' });
                return;
            }
            else if (QueryMode === 'save') {
                if (result.Body === "ok")
                    openToast(lang('已成功保存当前报表。', 'The current report has been saved successfully.'));
                else
                    openAlert(lang('请先运行报表，再尝试保存。', 'Please run the report first, and then try the save.'));
                $wrap.find('.iGridViewLoading').remove();//移除 loading
                return;
            }
            $dbody.scrollTop(0).scrollLeft(0).html('<div class="dtable"></div>');
            $wrap.find('.bodymask').hide();

            //HistoryID
            $wrap.attr('HistoryID', result.HistoryID || '');
            $wrap.attr('PageNo', result.PageNo || '');
            $wrap.attr('PageInfo', result.PageInfo || '');
            $wrap.attr('PageCount', result.PageCount || '');

            var $pagerinfo = $wrap.find('.dpagerinfo').html(result.Pager);

            if (result.Pager && $.browser.isPhone) {
                $pagerinfo.css({ width: '100%', height: '29px' });
            }

            $wrap.attr('PageNo', result.PageNo).attr('PageCount', result.PageCount).attr('retPageSize', result.PageSize).attr('RowCount', result.RowCount);

            BindPagerEvent();

            //报表体
            var bodyHtml = (result.Body || '')
                .replace(/\x11/g, "</td><td class=\"")
                .replace(/\x12/g, "</td></tr><tr><td class=\"")

                .replace(/\x13/g, "background-color:")
                .replace(/\x14/g, "font-family:")
                .replace(/\x15/g, "font-weight:")
                .replace(/\x16/g, "font-size:")
                .replace(/\x0E/g, "xlstd")
                .replace(/\x0F/g, "color:")

                .replace(/\x10t/g, "border-top:")
                .replace(/\x10r/g, "border-right:")
                .replace(/\x10b/g, "border-bottom:")
                .replace(/\x10l/g, "border-left:")

                .replace(/\x10s/g, "<span style=\"")
                .replace(/\x10a/g, "text-align:")
                .replace(/\x10v/g, "vertical-align:")

                .replace(/\x10p/g, "px Solid black;")
                .replace(/\x10c/g, "transparent;")
                .replace(/\x10d/g, "</td></tr><tr")
                .replace(/\x10h/g, "height:")
                .replace(/\x10k/g, "><td class=\"")
                ;

            if (bodyHtml.length > 20
                && (parseInt($wrap.attr('freezerows') || 0) > 0 || parseInt($wrap.attr('freezecols') || 0) > 0)
                && !$.browser.isPhone) {
                bodyHtml = bodyHtml.substr(0, bodyHtml.length - 16) + '<tr><td style="height:20px; border:none;"></td></tr></tbody></table>';
            }

            $dbody.find('>.dtable').html(bodyHtml);

            $dbody.iControls();

            //Footer
            var $dfooter = $wrap.find('.dfooter');
            if (result.Footer) {
                if ($dfooter.html() != result.Footer) {
                    $dfooter.html(result.Footer).show();
                    $wrap.find('.dpager').css('bottom', $dfooter.css('height'));
                }
            }
            else {
                $dfooter.html('').hide();
            }

            //excelsharp
            $dbody.find('.excelsharp').each(function () {
                this.style.top = this.parentElement.offsetTop + 'px';
            });

            //移除 loading
            if ($wrap.css('display') == 'none')
                $('body').find('.iGridViewLoading').remove();
            else
                $wrap.find('.iGridViewLoading').remove();

            //Freeze
            $wrap.attr('freezerows', result.FreezeRows).attr('freezecols', result.FreezeCols).iReportFreeze();

            //移动端计算自适应
            var tw = $dbody.find('>.dtable>table').outerWidth();
            var dw = $dbody.outerWidth() - 5;
            var th = $dbody.find('>.dtable>table').outerHeight();
            var dh = $dbody.outerHeight() - 5;

            //如果表格不高，但很宽，就顶部对齐
            $wrap.attr('aligntop', tw > dw - 60 && th < dh - 60 ? 'true' : 'false');

            //移动端计算自适应
            if ($.browser.isPhone) {
                var wp1 = (dw / tw - 1) * 100;
                var wp2 = (dh / th - 1) * 100;

                if (wp2 > wp1) wp1 = wp2;
                if (wp1 < -45) wp1 = -45;
                if (wp1 > 0) wp1 = 0;

                $wrap.iReportZoom(Math.floor(wp1));
            }

            //刷新高度
            $wrap.iCtrSetHeight();

            //与iReportFreeze里的iReportZoom都需要（不可删除）
            $wrap.iReportZoom();

            //treeClick
            $dbody.find(".treeImg").off('click').click(function () { iReportTreeClick(this); });
            $dbody.find(".htreeImg").off('click').click(function () { iReportHTreeClick(this); });
            $dbody.find(".vtreeImg").off('click').click(function () { iReportVTreeClick(this); });
            $dbody.find(">.dtable").find(".htreeImg[needcollapse], .vtreeImg[needcollapse], .treeImg[needcollapse]").click();

            $dbody.off('scroll').on('scroll', function () {
                if (_isIndFixl) return;
                var scrLeft = $dbody.scrollLeft();
                $dbody.find('.dfixt>.dfixtr').scrollLeft(scrLeft);
                var scrTop = $dbody.scrollTop();
                $dbody.find('.dfixl').scrollTop(scrTop);
            });

            var _isIndFixl = false;
            $dbody.find('>.dfixl').off('scroll mouseenter mouseleave').on({
                scroll: function () {
                    if (!_isIndFixl) return;
                    var scrTop = $(this).scrollTop();
                    $dbody.scrollTop(scrTop);
                },
                'mouseenter touchstart': function () {
                    _isIndFixl = true;
                },
                'mouseleave touchend': function () {
                    _isIndFixl = false;
                }
            });

            $dbody.scroll();

            //触发OnLoaded事件
            $wrap.triggerHandler("OnLoaded", result);
            $.each(ictr._rundata_.irptLoaded, function () { this(result, $wrap, result); });
            //回调函数
            if (callback) callback(result, $wrap, result);

            //移动端绑定手势
            $('body').TouchZoom({
                progress: function (scale) {
                    var rawScale = parseInt($wrap.attr('_rawScale') || 0);
                    scale = (rawScale / 100 + 1) * scale;
                    scale = (scale - 1) * 100;
                    scale = Math.floor(scale);
                    if (scale > 100) scale = 100;
                    if (scale < -90) scale = -90;
                    $wrap.iReportZoom(scale);
                },
                start: function () {
                    $wrap.attr('_rawScale', $wrap.find('.dpager>.dslidebar>.slidebar').ival() || 0);
                }
            });
        })
            .fail(function (xhr) {
                if (asyncmode === 'true') return;
                var errmsg = 'iReportData调用失败, 无法连接服务器, status:' + xhr.statusText + '(' + xhr.status + '),readyState:' + xhr.readyState;
                openToast(errmsg);
                console.log(errmsg)
                //移除 loading
                if ($wrap.css('display') == 'none')
                    $('body').find('.iGridViewLoading').remove();
                else
                    $wrap.find('.iGridViewLoading').remove();
                $wrap.removeAttr('isloaded');

                if (callback) callback(null);
                return;
            });

        //异步xmlhttprequest
        if ((QueryMode === "show" || QueryMode === "auto") && asyncmode === 'true') {
            setTimeout(function () {
                jqXhr.abort();
                $wrap.iGridViewWaitforLoadData(callback);
            }, 3000);
        }

        function BindPagerEvent() {
            var $dpagerinfo = $wrap.find('.dpagerinfo');
            $dpagerinfo.find('.nextpage').off('click').click(function () {
                if (parseInt($wrap.attr('PageNo')) + 1 <= parseInt($wrap.attr('PageCount'))) {
                    $wrap.attr('PageNo', parseInt($wrap.attr('PageNo')) + 1).iReport("page");
                }
            });

            $dpagerinfo.find('.prepage').off('click').click(function () {
                if (parseInt($wrap.attr('PageNo')) - 1 > 0) {
                    $wrap.attr('PageNo', parseInt($wrap.attr('PageNo')) - 1).iReport("page");
                }
            });

            $dpagerinfo.find('.firstpage').off('click').click(function () {
                $wrap.attr('PageNo', 1).iReport("page", 1);
            });

            $dpagerinfo.find('.lastpage').off('click').click(function () {
                $wrap.attr('PageNo', parseInt($wrap.attr('PageCount'))).iReport("page");
            });

            $dpagerinfo.find('.btngo').off('click').click(function () {
                var pageno = $dpagerinfo.find('.pageno').val();
                if (parseInt("1" + pageno) != "1" + pageno) {
                    pageno = $wrap.attr('PageNo');
                    $dpagerinfo.find('.pageno').val(pageno);
                    return;
                }
                $wrap.attr('PageNo', pageno).iReport("page");
            });

            $dpagerinfo.find('.selectpage').off('change').change(function () {
                var pageno = $dpagerinfo.find('.selectpage').val();
                $wrap.attr('PageNo', pageno).iReport("page");
            });
        }

    };

    $.fn.iReportPrint = function (QueryArgs) {
        var $wrap = $(this);
        if (!$wrap || $wrap.length === 0) return $wrap;
        if (QueryArgs && (QueryArgs.constructor === Object || $.trim(QueryArgs).substr(0, 1) == "{")) {
            $wrap.attr('QueryArgs', $.trim($.toJsonString(QueryArgs)));
        }

        if ($wrap.css('display') === 'none') {
            openLoading('正在生成打印，请稍候');
        }
        $wrap.iReport('print', function () {
            closeLoading();
        });
        return $wrap;
    };

    $.fn.iReportFreeze = function () {
        var $this = $(this);
        if ($this.length === 0) return;
        else if ($this.length > 1) {
            $this.each(function () { $(this).iReportFreeze(); });
            return $this;
        }

        var $dbody = $this.find('.dbody');
        var $dtable = $dbody.find('>.dtable');
        var $table = $dtable.find('>table');

        var freezerows = $this.attr('freezerows') || '0';
        var freezecols = $this.attr('freezecols') || '0';

        var tabHtml = ''
        if (freezerows > 0 || freezecols > 0) {
            tabHtml = $dtable.html();
            tabHtml = tabHtml.substr(tabHtml.indexOf('<table class="iReport"'))
        }
        $dbody.find('.dfixt').remove();
        $dbody.find('.dfixl').remove();

        var freezeHeight = 0;
        var freezeWidth = 1;

        $table.find('>colgroup>col').each(function (index) {
            if (index < freezecols)
                freezeWidth += parseFloat($(this).attr('width'));
            else
                return false;
        });

        if (freezerows > 0 && $table.length > 0) {
            var $freezetrs = $table.find('>tbody>tr:eq(' + freezerows + ')');
            if ($freezetrs.length > 0) {
                freezeHeight = $freezetrs.offset().top - $table.offset().top + 1;
            }
        }

        if (freezerows > 0) {
            var $fix = $(tabHtml);
            $fix.find('>tbody>tr:gt(' + (freezerows - 1) + ')').remove();
            var fixHtml = $fix.length > 0 ? $fix[0].outerHTML : '';

            var dfixtl = "";
            if (freezecols > 0) dfixtl = "<div class=\"dfixtl\" rawW=\"" + freezeWidth + "\" style=\"width:" + freezeWidth + "px;\">" + fixHtml + "</div>";
            var dfixtr = "<div class=\"dfixtr\">" + fixHtml + "</div>";
            $dbody.append("<div class=\"dfixt\" rawH=\"" + freezeHeight + "\" rawW=\"" + freezeWidth + "\" style=\"height:" + freezeHeight + "px;\">" + dfixtl + dfixtr + "</div>");
        }

        if (freezecols > 0) {
            var overflowstyle = ($.browser.isPhone || $.browser.chrome) ? ' overflow-y:auto;' : ''; //配合#box::-webkit-scrollbar { display: none; } 仅支持chrome
            $dbody.append('<div class="dfixl" rawW="' + freezeWidth + '" style="width:' + freezeWidth + 'px; height:100%;' + overflowstyle + '">' + tabHtml + '</div>');
        }
        return $this.iReportZoom();
    };

    $.fn.iReportZoom = function (val) {
        var $this = $(this);
        if (!val && val !== 0 && val !== "0") val = $this.find('.dpager>.dslidebar>.slidebar').ival() || 0;

        _miss_fun._isPauseAfterChange = true;
        $this.find('.dpager>.dslidebar>.slidebar').ival(val);
        _miss_fun._isPauseAfterChange = false;

        var $dbody = $this.find('.dbody');
        var $dtable = $dbody.find('>.dtable');

        if ($dtable.length === 0 || !$dtable[0].firstChild) return;

        var $table = $dtable.find('>.iReport');
        var tabW = $table.outerWidth();
        var tabH = $table.outerHeight();

        var scale = val / 100 + 1;
        var margintop = (tabH * scale - tabH) / 2 + "px";
        var marginleft = (tabW * scale - tabW) / 2 + "px";

        var isFreeze = parseInt($this.attr('freezerows') || 0) > 0 || parseInt($this.attr('freezecols') || 0) > 0;

        $dbody.find('.iReport').css({ "margin": margintop + " " + marginleft, "transform": "scale(" + scale + "," + scale + ")" });

        var $dfixt = $dbody.find('.dfixt');
        if ($dfixt.length > 0) {
            var margintopT = $dfixt.attr('rawH') * (scale - 1) / 2 + "px";
            $dbody.find('.dfixt .iReport').css({ "margin-top": margintopT, "margin-bottom": margintopT });

            $dfixt.outerHeight($dfixt.attr('rawH') * scale);
            $dfixt.find('>div').outerHeight($dfixt.attr('rawH') * scale);

            var $dfixtl = $dfixt.find('.dfixtl');
            $dfixtl.outerWidth($dfixtl.attr('rawW') * scale);
        }
        var $dfixl = $dbody.find('.dfixl');
        if ($dfixl.length > 0) {
            $dfixl.outerWidth($dfixl.attr('rawW') * scale);
        }

        var margin_l = "0px";
        var dzoomWidth = $dtable.width();
        var dbodyWidth = $dbody.width();

        if (!isFreeze && !$.browser.isPhone) {
            if (dbodyWidth - dzoomWidth - scale * 80 - 2 > 0) margin_l = (dbodyWidth - dzoomWidth - scale * 80 - 2) / 2 + "px";
        }
        else {
            if (dbodyWidth - dzoomWidth > 0) margin_l = (dbodyWidth - dzoomWidth) / 2 + "px";
        }
        var margin_t = "0px";
        var dzoomHeight = $dtable.outerHeight();
        var dbodyHeight = $dbody.outerHeight();
        if (dzoomHeight < dbodyHeight) margin_t = (dbodyHeight - dzoomHeight) / 2 + "px";

        var lheight = dbodyHeight - parseFloat(margin_t.replace('px', '')) - 1;

        var hasVScroll = false;
        var hasHScroll = false;
        //检测是否有横向滚动条
        var _dbody = $dbody[0];
        var sl = _dbody.scrollLeft;
        _dbody.scrollLeft += sl > 0 ? -1 : 2;
        if (_dbody.scrollLeft !== sl) {
            hasHScroll = true;
            lheight -= _dbody.offsetHeight - _dbody.clientHeight; //滚动条宽度
        }
        _dbody.scrollLeft = sl;

        var twidth = dbodyWidth - parseFloat(margin_l.replace('px', ''));
        //检测是否有纵向滚动条
        sl = _dbody.scrollTop;
        _dbody.scrollTop += sl > 0 ? -1 : 2;
        if (_dbody.scrollTop !== sl) {
            hasVScroll = true;
            twidth -= _dbody.offsetWidth - _dbody.clientWidth; //滚动条宽度
        }
        _dbody.scrollTop = sl;

        //顶部对齐设成0，否则中间对齐
        if ($this.attr('aligntop') == 'true') margin_t = '0px';

        if (!hasHScroll) twidth = $dtable.width();
        if (!hasVScroll) lheight = $dtable.height();
        $dtable.css({ 'margin-left': margin_l, 'margin-top': margin_t });
        if ($dfixt.length > 0) $dfixt.css({ 'margin-left': margin_l, 'margin-top': margin_t, 'width': (twidth + 1) + "px" });
        if ($dfixl.length > 0) $dfixl.css({ 'margin-left': margin_l, 'margin-top': margin_t, 'height': lheight + "px" });

        var borderMargin = scale * 40;
        if ($this.attr('ShowBorder') == 'true') {
            if (!isFreeze && !$.browser.isPhone) {
                $dtable.addClass('rptborder').css('padding', borderMargin + 'px');
                if (parseFloat(margin_t) < 6) $dtable.css('margin-top', '6px');
            }
            else {
                $this.find('>.bodymask').css({
                    'margin-left': (parseFloat(margin_l) - borderMargin) + 'px',
                    'margin-top': (parseFloat(margin_t) - borderMargin) + 'px',
                    'width': ($dtable.width() + borderMargin * 2) + 'px',
                    'height': ($dtable.height() - ($.browser.isPhone ? 0 : 20 * scale) + borderMargin * 2) + 'px'
                }).show();
            }
        }

        return $this;
    };

    function iReportTreeClick(objSpan) {
        var $obj = $(objSpan);
        var $tr = $obj.parent().parent();
        var $fOrdbody = $tr.parent().parent().parent();

        var rowindex = $tr.parent().find('>tr').index($tr);
        var $tr1;
        var $obj1;
        if ($fOrdbody.hasClass('dtable')) {
            $tr1 = $fOrdbody.parent().find('.dfixl>table>tbody>tr:eq(' + rowindex + ')');
        } else {
            $tr1 = $fOrdbody.parent().find('.dtable>table>tbody>tr:eq(' + rowindex + ')');
        }
        $obj1 = $tr1.find('>td:first>span');

        if (!$obj.attr('isexpand') || $obj.attr('isexpand') === 'true') {
            $obj.attr('isexpand', 'false');
            $obj.removeClass('xicon-line').addClass('xicon-plus');
            var tk = $tr.attr('tk');
            $tr.attr('exp', 'false');
            $tr.parent().find(">tr[tk^='" + tk + "'][tk!='" + tk + "']").hide();
            //
            $obj1.attr('isexpand', 'false');
            $obj1.removeClass('xicon-line').addClass('xicon-plus');
            $tr1.attr('exp', 'false');
            $tr1.parent().find(">tr[tk^='" + tk + "'][tk!='" + tk + "']").hide();
        } else {
            $obj.attr('isexpand', 'true');
            $obj.removeClass('xicon-plus').addClass('xicon-line');
            $tr.attr('exp', 'true');
            iReportClickChild($tr);
            //
            $obj1.attr('isexpand', 'true');
            $obj1.removeClass('xicon-plus').addClass('xicon-line');
            $tr1.attr('exp', 'true');
            iReportClickChild($tr1);
        }

        //excelsharp
        $fOrdbody.parent().parent().find('.excelsharp').each(function () {
            this.style.top = this.parentElement.offsetTop + 'px';
        });

        $fOrdbody.parent().parent().iReportZoom();

        function iReportClickChild($tr) {
            var tk = $tr.attr('tk');
            if (!$tr.attr('exp') || $tr.attr('exp') === 'true') {
                $tr.parent().find(">tr[pk='" + tk + "']").show();
                $tr.parent().find(">tr[pk='" + tk + "'][isParent='true']").each(function () {
                    iReportClickChild($(this));
                });
            }
        }
    }

    function iReportHTreeClick(objSpan) {
        var $obj = $(objSpan);
        var $rpt = $obj.parentUntil(function ($e) { return $e.attr('ctrtype') === 'iReport' });

        var htreeKey = $obj.attr('htreeKey')
        if (!htreeKey) {
            htreeKey = Math.random().toString().substr(3, 8)
            $obj.attr('htreeKey', htreeKey);

            var c = $obj.attr('c');
            if (!c) return;
            c = c.split(',');
            if (c.length !== 2) return;
            var c1 = parseInt($.trim(c[0])) || 0;
            var c2 = parseInt($.trim(c[1])) || 0;

            $rpt.find('table.iReport').each(function () {
                var $t = $(this);

                var rowSpanList = [];
                $t.find('>tbody>tr').each(function (trIdx) {
                    var $tr = $(this);

                    var cellIdx = 0;
                    $tr.find('>td').each(function () {
                        var $td = $(this);
                        cellIdx = getRowSpan(rowSpanList, trIdx, cellIdx);
                        if (cellIdx >= c1 && cellIdx <= c2) {
                            $td.attr('htreeKey', htreeKey).attr('htreeraw', $td.html()).attr('htreecss', $td.css('border-left') + "|" + $td.css('border-right'));
                        }
                        var colspan = parseInt($td.attr('colspan') || 1);
                        var rowspan = parseInt($td.attr('rowspan') || 1);
                        if (rowspan > 1) {
                            rowSpanList.push({ trIdx: trIdx, rowspan: rowspan, cellIdx: cellIdx, colspan: colspan });
                        }
                        cellIdx += colspan;
                    });
                })
                $t.find('>colgroup>col').each(function (idx) {
                    if (idx >= c1 && idx <= c2) {
                        var $col = $(this);
                        $col.attr('rawwidth', $col.attr('width')).attr('htreeKey', htreeKey);
                    }
                });
            });
        }

        if ($obj.hasClass('fa-rotate-180')) {
            $obj.removeClass('fa-rotate-180');
            $rpt.find('td[htreeKey="' + htreeKey + '"]').each(function () {
                var $td = $(this);
                var css = $td.attr('htreecss').split('|');
                $td.html($td.attr('htreeraw')).css({ 'border-left': css[0], 'border-right': css[1] });
            });
            $rpt.find('col[htreeKey="' + htreeKey + '"]').each(function () {
                var $col = $(this);
                $col.attr('width', $col.attr('rawwidth'))
            });
        }
        else {
            $obj.addClass('fa-rotate-180');
            $rpt.find('td[htreeKey="' + htreeKey + '"]').html('').css({ 'border-left': 'none', 'border-right': 'none' });
            $rpt.find('col[htreeKey="' + htreeKey + '"]').attr('width', '0.001');
        }

        $rpt.find('table.iReport').each(function () {
            var $t = $(this);
            var allwidth = 0;
            $t.find('>colgroup>col').each(function () {
                allwidth += parseFloat($(this).attr('width'));
            });
            $t.outerWidth(allwidth);
        });

        $rpt.iReportZoom();

        function getRowSpan(rowSpanList, trIdx, cellIdx) {
            for (var i = 0; i < rowSpanList.length; i++) {
                var s = rowSpanList[i];
                if (s.trIdx + s.rowspan - 1 < trIdx) continue;
                if (s.cellIdx == cellIdx) {
                    cellIdx += s.colspan;
                }
            }
            return cellIdx;
        }
    }

    function iReportVTreeClick(objSpan) {
        var $obj = $(objSpan);
        var c = $obj.attr('c');
        if (!c) return;

        var $tr = $obj.parent().parent();

        var r = getRange($obj);

        if (r.to < 2) return;

        var $fOrdbody = $tr.parent().parent().parent();
        var $tr1;
        var $obj1;
        if ($fOrdbody.hasClass('dtable')) {
            $tr1 = $fOrdbody.parent().find('.dfixl>table>tbody>tr:eq(' + r.from + ')');
        } else {
            $tr1 = $fOrdbody.parent().find('.dtable>table>tbody>tr:eq(' + r.from + ')');
        }
        $obj1 = $tr1.find('>td:first>span');

        if ($obj.hasClass('xicon-line')) {
            $obj.removeClass('xicon-line').addClass('xicon-plus');
            $tr.parent().find(">tr:gt(" + r.from + "):lt(" + r.to + ")").hide();
            //
            $obj1.removeClass('xicon-line').addClass('xicon-plus');
            $tr1.parent().find(">tr:gt(" + r.from + "):lt(" + r.to + ")").hide();
        } else {
            $obj.removeClass('xicon-plus').addClass('xicon-line');
            ExpandVTree($tr, r);
            //
            $obj1.removeClass('xicon-plus').addClass('xicon-line');
            ExpandVTree($tr1, r);
        }

        //excelsharp
        $fOrdbody.parent().parent().find('.excelsharp').each(function () {
            this.style.top = this.parentElement.offsetTop + 'px';
        });

        $fOrdbody.parent().parent().iReportZoom();

        //---------------------------------------------------

        function getRange($obj) {

            var $tr = $obj.parent().parent();

            var rowindex = $tr.parent().find('>tr').index($tr);

            var c = $obj.attr('c');
            if (!c) return { from: rowindex, to: rowindex };

            if (/^[0-9]+$/.test(c)) {
                c = parseInt(c);
            }
            else {
                var c1 = -1;
                $tr.parent().find(">tr:gt(" + rowindex + ")").each(function (idx) {
                    if ($(this).attr('_trflag') == c) {
                        c1 = idx + 1;
                        return false;
                    }
                });
                c = c1;
            }
            return { from: rowindex, to: c };
        }

        function ExpandVTree($tr, r) {
            var $trs = $tr.parent().find(">tr:gt(" + r.from + "):lt(" + r.to + ")");
            for (var i = 0; i < $trs.length; i++) {
                var $thistr = $trs.eq(i).show();
                var $vtImg = $thistr.find('span.vtreeImg');
                if ($vtImg.length > 0 && $vtImg.hasClass('xicon-line') == false) {
                    var r1 = getRange($vtImg);
                    i += (r1.to - 0);
                    continue;
                }
            }
        }
    }

    $.fn.iReportSave = function () {
        var $wrap = $(this);
        if (!$wrap.attr('HistoryID') && $wrap.attr('ctrtype') === 'iReport') {
            openAlert(lang('请查询后再保存。', 'Please launch the report first.'));
            return;
        }
        window._iReportSave_QueryArgs = {};
        var qa = $wrap.attr('QueryArgs');
        if (qa) {
            qa = $.JsonObject(qa);
            Object.keys(qa).forEach(function (key) {
                if (!(key.substr(0, 1) === '$' && key.substr(1) in window._iReportSave_QueryArgs)
                    && key !== 'FastCategoryValue' && key !== 'FastSearchString'
                    && key !== '$isViewMode' && key !== '$isWorkFlow'
                ) {
                    if (!(key == '$url' && $.isEmptyObject(qa[key])))
                        window._iReportSave_QueryArgs[key] = qa[key];
                }
            });
        }

        openDialog('/Common/iControls/iReport_Save', 500, 370, function (ret) {
            if (!ret) return;
            ret.QueryConditions = JSON.stringify(window._iReportSave_QueryArgs);
            $wrap.attr('SaveArgs', JSON.stringify(ret));
            if ($wrap.attr('ctrtype') === "iGridView")
                $wrap.iGridView("save");
            else
                $wrap.iReport("save");
        });
    };

    $.fn.iReportGetEditJson = function () {
        var jo = {};
        $(this).find('[bindfield]').each(function () {
            var $ctr = $(this);
            var value = $ctr.ival();
            jo[$ctr.attr('bindfield') || $ctr.attr('id')] = value;
        });
        return jo;
    }

    $.fn.iGridViewSave = function () { $(this).iReportSave(); };

    $.fn.iReportHistory = function (HistoryDataID, callback) {
        var $wrap = $(this);
        if (HistoryDataID) {
            loadHistory($wrap, HistoryDataID);
            return $wrap;
        }
        var ReportKey = $wrap.iGridViewGetGridKey();

        var ctrtype = $wrap.attr('ctrtype');
        openDialog('/Common/iControls/' + ctrtype + '_History?repkey=' + ReportKey, function (ret) {
            if (ret) loadHistory($wrap, ret);
        });
        return $wrap;

        function loadHistory($wrap, hID) {
            $wrap.attr('HistoryID', hID);
            if ($wrap.attr('ctrtype') === "iGridView")
                $wrap.iGridView("history", callback);
            else
                $wrap.iReport("history", callback);
        }
    };

    $.fn.iGridViewHistory = function (HistoryDataID, callback) { $(this).iReportHistory(HistoryDataID, callback); };

    $.fn.SetQueryArgs = function (KeyOrArgs, val) {
        var $wrap = $(this);
        if (!KeyOrArgs) return $wrap.attr('QueryArgs', '');

        var jo = $.JsonObject($wrap.attr('QueryArgs') || '{}');

        if (arguments.length === 1) {
            var joNew = $.JsonObject(KeyOrArgs);

            Object.keys(joNew).forEach(function (key) {
                jo[key] = joNew[key];
            });
        }
        else {
            jo[KeyOrArgs] = val;
        }
        return $wrap.attr('QueryArgs', $.toJsonString(jo));
    };

    //-- iGridView ------------------------------------------------------------------------------

    $.fn.iGridView = function (QueryMode, PageNo, callback) {
        //查询模式：actual, buffer, history, exportXLS, exportCsv, exportPdf, exportHtml, save, background,
        //refresh(actual + page + scrollTop)
        //reload(buffer + page + scrollTop)
        var $wrap = $(this);
        if (!$wrap || $wrap.length === 0) return $wrap;

        if (QueryMode) {
            if (QueryMode.constructor === Function) {
                callback = QueryMode;
                QueryMode = "actual";
                PageNo = "1";
            }
            else if (QueryMode.constructor === Object || $.trim(QueryMode).substr(0, 1) == "{") {
                $wrap.attr('QueryArgs', $.trim($.toJsonString(QueryMode)));
                QueryMode = "actual";
            }
        }
        if (arguments.length === 2 && PageNo && PageNo.constructor === Function) {
            callback = PageNo;
            PageNo = "1";
        }

        if (!QueryMode) QueryMode = "actual";
        if (!PageNo) PageNo = "1";

        $wrap.attr('isloaded', 'start');
        var ctrID = $wrap.attr('ID') || '';

        //显示 loading
        var loadingTop = ($wrap.outerHeight() - 40) / 2;
        var loadingLeft = ($wrap.outerWidth() - 30) / 2;
        if (loadingTop < 10) loadingTop = 10;
        $wrap.find('.iGridViewLoading').remove();
        $wrap.append($('<div class="iGridViewLoading"></div>').offset({ top: loadingTop, left: loadingLeft }));
        $wrap.find('.Refresh').removeClass('fa-spin').addClass('fa-spin');

        //触发BeforeGetData事件
        $wrap.triggerHandler("BeforeGetData");
        $.each(ictr._rundata_.igvBeforeGetData, function () { this($wrap, ctrID); });

        //_directSearchString
        var _directSearchString = $wrap.attr('_directSearchString');
        if (_directSearchString) {
            if (_directSearchString == '#clearsearching#') _directSearchString = '';

            $wrap.SetQueryArgs('FastSearchString', _directSearchString);
            $wrap.removeAttr('_directSearchString');
        }

        //读取iGridView各项参数
        var rawActiveRowIdx = -1;
        if (QueryMode == "refresh" || QueryMode == "reload") {
            if (QueryMode == "refresh") {
                QueryMode = "actual";
            }
            else {
                QueryMode = "buffer";
            }
            PageNo = $wrap.attr('PageNo') || "1";
            rawActiveRowIdx = $wrap.find('>.dbody>.tbody>tbody>tr').index($wrap.find('>.dbody>.tbody>tbody>tr[activated="true"]'));
        }

        if (QueryMode == "actual") $wrap.attr('_isHasCacheData', 'false');

        var RowHead = $wrap.attr('RowHead') || "normal";
        var PageSize = $wrap.attr('PageSize') || '50';
        var isTemplate = $wrap.attr('isTemplate') === 'true';
        var isDetail = $wrap.attr('isDetail') === 'true';
        var GridKey = $wrap.iGridViewGetGridKey();

        if (!window._IsiGridViewKeepBuffer) {
            if (!window._iReferenceGridBuffer) window._iReferenceGridBuffer = [];
            if ($.inArray(GridKey, window._iReferenceGridBuffer) === -1) window._iReferenceGridBuffer.push(GridKey);
        }

        var EditMode = $wrap.attr('EditMode') || "none";
        if (EditMode === "all") {
            PageSize = 0;
            if (RowHead === 'normal') {
                $wrap.attr('RowHead', 'lineno10');
                RowHead = 'lineno10';
            }
            $wrap.attr('freezecols', RowHead !== 'none' ? '1' : "0");
        }

        if ($.isPrintPreview()) {
            PageSize = 0;
            if (RowHead == 'normal') {
                $wrap.attr('RowHead', 'none');
                RowHead = "none";
            }
        }

        var freezecols = $wrap.attr('freezecols') || "0";
        if (RowHead != "none" && freezecols == "0" && EditMode !== "all") {
            $wrap.attr('freezecols', '1');
            freezecols = "1";
        }

        var igvWidth = $wrap.outerWidth();
        if (igvWidth <= 0) igvWidth = $wrap.parent().width() - 2;
        if (igvWidth <= 0) igvWidth = $wrap.parent().parent().width() - 2;
        if (igvWidth <= 0) igvWidth = $wrap.parent().parent().parent().width() - 2;
        if (igvWidth <= 0) igvWidth = innerWidth - 18;

        var GridArgs = {
            ctrID: ctrID,
            GridKey: GridKey,
            EditMode: EditMode,
            saveedit: $wrap.attr('saveedit') === 'true',
            Columns: $.JsonObject($wrap.attr('columns') || ""),
            QueryArgs: $wrap.attr('QueryArgs') || "",
            SaveArgs: $wrap.attr('SaveArgs') || "",
            KeyField: $wrap.attr('keyfield') || "",
            ExtField: $wrap.attr('extfield') || "",
            Reference: getUrlArg("e"),
            TreeKey: $wrap.attr('treeKey') || "",
            FastSearchFields: $wrap.attr('FastSearchFields') || "",
            RowHead: RowHead,
            freezecols: freezecols,
            SumTitle: $wrap.attr('SumTitle') || '',
            PageSize: PageSize,
            PageNo: PageNo,
            SortString: $wrap.attr('SortString') || "",
            asyncmode: $wrap.attr('asyncmode') || "",
            Width: igvWidth || 0,
            EntityName: $wrap.attr('EntityName') || '',
            ExtAttr: $wrap.attr('ExtAttr') || '',
            QueryMode: QueryMode,
            DateFormat: $wrap.attr('DateFormat') || 'auto',
            HistoryID: $wrap.attr('HistoryID') || "0",
            cachetype: $wrap.attr('cachetype') || 'inproc',
            action: svr._currentAssembly,
            isExportTree: $wrap.attr('isExportTree') || '',
            PagingMode: $wrap.attr('PagingMode') || 'Auto',
            _isHasCacheData: $wrap.attr('_isHasCacheData') || 'false',
            isTemplate: isTemplate,
            lt: $wrap.attr('lt') || ''
        };

        var url = "/api/icontrols/iGridViewData/GetData";
        var jqXhr = $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            timeout: 7200000,
            url: url,
            data: { GridArgs: $.toJsonString(GridArgs) }
        }).done(function (ret) {

            if (QueryMode === "actual") $.SetRemoteData("/api/common/setReportRead?key=" + encodeURIComponent(GridKey) + "&flag=g");

            $wrap.attr('isloaded', 'true');
            if (isError(ret)) {
                openAlert(ret);
                $wrap.find('.iGridViewLoading').remove();//移除 loading
                $wrap.find('.Refresh').removeClass('fa-spin');
                if (callback) callback(ret, true);
                return;
            }
            var result = $.JsonObject(ret);

            //是否已缓存完整数据
            $wrap.attr('_isHasCacheData', result["_isHasCacheData"]);

            //导出
            if (QueryMode === 'exportXLS' || QueryMode === 'exportCsv' || QueryMode === 'exportPdf' || QueryMode === 'exportHtml') {
                _miss_fun.iGridViewExportExcel($wrap);
                return;
            }

            //保存
            if (QueryMode === 'save') {
                if (result.Body === "ok")
                    openToast(lang('已成功保存当前报表。', 'The current report has been saved successfully.'));
                else
                    openAlert(lang('请先运行报表，再尝试保存。', 'Please run the report first, and then try the save.'));
                $wrap.find('.iGridViewLoading').remove();//移除 loading
                $wrap.find('.Refresh').removeClass('fa-spin');
                return;
            }

            var $dhead = $wrap.find('.dhead');
            var $dbody = $wrap.find('.dbody');

            var scrLeft = $dbody.scrollLeft();
            var scrTop = $dbody.scrollTop();
            //HistoryID
            $wrap.attr('HistoryID', result.HistoryID || '');

            //页脚 Pager
            var $pagerinfo = $wrap.find('.dpagerinfo').html(result.Pager);
            var timetitle = '获取数据时间：' + result.BuildDataTime + "毫秒\r\n生成表格时间：" + result.BuildTableTime + "毫秒\r\n合计时间：" + (parseInt(result.BuildDataTime) + parseInt(result.BuildTableTime)) + "毫秒";
            $pagerinfo.find('.pageinfo').attr('title', timetitle);
            $wrap.attr('PageNo', result.PageNo).attr('PageCount', result.PageCount).attr('retPageSize', result.PageSize).attr('RowCount', result.RowCount);

            //Footer
            var $dfooter = $wrap.find('.dfooter');
            if (result.Footer) {
                if ($dfooter.html() != result.Footer) {
                    $dfooter.html(result.Footer).show();
                    $wrap.find('.dpager').css('bottom', $dfooter.css('height'));
                }
            } else {
                $dfooter.html('').hide();
            }

            //Columns
            if (result.Columns) $wrap.attr('Columns', $.toJsonString(result.Columns));

            //表头
            $dhead.html(result.Head);
            //表行
            $dbody.html((result.Body || '')
                .replace(/\x11/g, "</td><td i='")
                .replace(/\x12/g, "><td i='0' rowhead=\"")
                .replace(/\x13/g, "</td></tr><tr keyValue=\"")
                .replace(/\x14/g, "</td></tr><tr ")
                .replace(/\x15/g, "style=\"text-align:center")
                .replace(/\x16/g, "style=\"text-align:right")
                .replace(/\x0E/g, "<img border=\"0\" src=\"/Images/Common/Tree/TreeLines/")
                .replace(/\x0F/g, "&nbsp;")

                .replace(/\x10a/g, ".gif\" onclick=\"_miss_fun.iGridViewTreeClick(this)\" id=\"")
                .replace(/\x10b/g, "style=\"padding:0px;line-height:23px;\"")
                .replace(/\x10c/g, "<col width=\"")
                .replace(/\x10d/g, "px\" columnname=\"")
                .replace(/\x10e/g, "\" fieldtype=\"")
                .replace(/\x10f/g, "><div class=\"dTreeLine\">")
            );

            var $thead = $dhead.find('>table');
            var $tbody = $dbody.find('>table');

            //Template
            if (isTemplate) vm.data[ctrID + '_$igvdt'] = result.data;

            //汇总行
            $wrap.attr('SumTitle', result.SumTitle || '');
            var $dsum = $wrap.find('.dsum');
            var $tsum = null;
            if (result.SumRow) {
                $dsum.html(result.SumRow).show();
                $tsum = $dsum.find('>.tsum');
            }
            else {
                $dsum.html('').hide();
            }

            //FreezeCols
            $wrap.attr('freezecols', result.freezecols).attr('RowHead', result.RowHead);

            //checklist
            if (QueryMode === 'actual' || QueryMode === 'history') $wrap.attr('checklist', result.CheckList || '');

            $thead.find('>thead>tr>th').bind("mousemove", function (event) {
                event = event || window.event;
                var th = $(this);
                var left = th.offset().left;
                if ($wrap.attr('rowhead') == "none") {
                    if (th.prevAll().length == 0 && event.clientX - left < 4) return;
                } else {
                    if (th.prevAll().length == 0 || th.prevAll().length == 1 && event.clientX - left < 8) {
                        th.css({ 'cursor': 'default' });
                        return;
                    }
                }

                if (event.clientX - left < 4 || (th.width() - (event.clientX - left)) < 4) {
                    th.css({ 'cursor': 'col-resize' });
                } else {
                    th.css({ 'cursor': 'default' });
                }
            }).bind("mousedown", function (event) {
                event = event || window.event;
                var th = $(this);

                if (event.button === 2) {
                    openColumnMenu(event, th);
                    window.returnValue = false;
                    return false;
                }

                var pos = th.offset();
                var left = th.offset().left;
                if ($wrap.attr('rowhead') === "none") {
                    if (th.prevAll().length === 0 && event.clientX - left < 4) return;
                } else {
                    if (th.prevAll().length === 0 || th.prevAll().length === 1 && event.clientX - left < 4) return;
                }
                if (event.clientX - pos.left < 4 || th.width() - (event.clientX - pos.left) < 4) {
                    _miss_fun._iGridViewlineMove = true;
                    if (event.clientX - pos.left < th.outerWidth() / 2) {
                        _miss_fun._iGridViewcurrTh = th.prev();
                    } else {
                        _miss_fun._iGridViewcurrTh = th;
                    }
                    $wrap.attr('IsSpliting', 'true');
                }
                $("body").unbind("mousemove").bind("mousemove", function (event) {
                    event = event || window.event;

                    if (_miss_fun._iGridViewlineMove == true) {
                        var pos = _miss_fun._iGridViewcurrTh.offset();
                        var newWidth = event.clientX - pos.left;
                        if (newWidth > 0) {
                            var columnname = _miss_fun._iGridViewcurrTh.attr('columnname');
                            $thead.find('>colgroup>col[columnname="' + columnname + '"]').attr('width', newWidth);
                            $tbody.find('>colgroup>col[columnname="' + columnname + '"]').attr('width', newWidth);
                            if ($tsum) $tsum.find('>colgroup>col[columnname="' + columnname + '"]').attr('width', newWidth);
                        }
                        //计算表格实际宽度（解决IE 10.0 bug）
                        var tmpallwidth = 0;
                        $tbody.find('>colgroup>col').each(function () {
                            tmpallwidth += parseFloat($(this).attr('width').replace('px', ''));
                        });
                        $tbody.outerWidth(tmpallwidth);
                        if ($tsum) $tsum.outerWidth(tmpallwidth);
                    }
                }).unbind("mouseup").bind("mouseup", function (event) {
                    event = event || window.event;
                    iGridViewMouseup(event);
                }).unbind("selectstart").bind("selectstart", function () { return !_miss_fun._iGridViewlineMove; });
            });

            //运行编辑脚本
            _miss_fun._iGridViewTDEdit_Columns['A' + ctrID] = [];
            if (QueryMode == 'actual' && $('#' + ctrID + "_HiddenScript").length > 0) {
                $('#' + ctrID + "_HiddenScript").val('');
            }

            if (result.EditScript) {
                if ($('#' + ctrID + "_HiddenScript").length === 0) {
                    $('body').append("<input id='" + ctrID + "_HiddenScript' type='hidden'/>");
                }
                $('#' + ctrID + "_HiddenScript").val(result.EditScript);
                eval(result.EditScript);
            }
            else if ($('#' + ctrID + "_HiddenScript").val()) {
                eval($('#' + ctrID + "_HiddenScript").val());
            }

            if (!isDetail) {
                //添加tooptip
                setTimeout(function () {
                    $tbody.find('>tbody>tr>td').each(function () {
                        var $thistd = $(this);
                        var tdtitle = $.trim($thistd.attr('title') || $thistd.text());
                        if (!tdtitle)
                            $thistd.removeAttr('title');
                        else
                            $thistd.attr('title', tdtitle);
                    });
                }, 0);
            }
            //移除 loading
            $wrap.find('.iGridViewLoading').remove();
            $wrap.find('.Refresh').removeClass('fa-spin');

            initiGridView();

            //恢复 ScrollLeft/ScrollTop
            setTimeout(function () {
                $dbody.scrollLeft(scrLeft);
                $wrap.find('>.dhead').scrollLeft(scrLeft);
                $dbody.scrollTop(scrTop);
                $wrap.find('>.fdbody').scrollTop(scrTop);
            }, 0);

            //绑定pager事件
            BindPagerEvent();

            if (!isDetail) {
                _miss_fun.iGridViewScroll($dbody);

                $dbody.off('scroll mouseenter mouseleave').on({
                    scroll: function () {
                        _miss_fun.iGridViewScroll(this);
                    },
                    'mouseenter touchstart': function () {
                        _miss_fun._iGridViewScrollCtr = 'd';
                        _miss_fun.iGridViewScroll(this);
                    },
                    'mousemove touchmove': function () {
                        _miss_fun._iGridViewScrollCtr = 'd';
                        //$(this).off('mousemove');
                    }
                });

                $wrap.find('.fdbody').off('scroll mouseenter mouseleave').on({
                    scroll: function () {
                        _miss_fun.iGridViewScroll(this);
                    },
                    'mouseenter touchstart': function () {
                        _miss_fun._iGridViewScrollCtr = 'f';
                        _miss_fun.iGridViewScroll(this);
                    },
                    'mousemove touchmove': function () {
                        _miss_fun._iGridViewScrollCtr = 'f';
                        //$(this).off('mousemove');
                    }
                });
            }
            //触发OnLoaded事件
            $wrap.triggerHandler("OnLoaded", result);
            $.each(ictr._rundata_.igvLoaded, function () { this($wrap, ctrID, result); });
            if (callback) callback(result);

            var partner = $wrap.attr('partner');
            if (partner) {
                var pp = partner.split(',');
                for (var i = 0; i < pp.length; i++) {
                    var partnerID = $.trim(pp[i]);
                    $('#' + partnerID).removeAttr('isloaded');
                }
                _miss_fun.iGridViewBuildPartner($wrap);
            }

            if (rawActiveRowIdx > -1) {
                $wrap.iGridViewActiveRow(rawActiveRowIdx);
            }
            else {
                //设置首行为选中行
                if ($wrap.attr('ActiveFistRow') === 'true') $wrap.iGridViewActiveRow(0);
            }

            function initiGridView() {
                $thead.find('>thead>tr').each(function () {
                    if ($(this).find('.emptyth').length === 0) $(this).append('<th class="emptyth" style="width:8000px;">&nbsp;</th>');
                });

                iGridViewSort();
                iGridViewSetCheckbox();
                $wrap.iGridViewSetMoveColor();
                $wrap.iGridViewFreezeTable();

                //重新规划列宽
                _miss_fun.iGridViewOptimizeWidth($wrap);
                //重新刷新高度
                setTimeout(function () {
                    if ($wrap.attr('AutoHeight') === 'true' && $wrap.attr('isDetail') !== 'true') {
                        $wrap.iCtrSetHeight(-1);
                    }
                    else {
                        $wrap.iCtrSetHeight();
                    }
                }, 0);

                //设置checkbox点击整件
                function iGridViewSetCheckbox() {
                    if ($wrap.attr('rowhead') != 'checkbox') return;
                    $wrap.iGridViewSetChecklist();
                    $tbody.find('>tbody>tr').find('>td:first>input[type="checkbox"]').off('click').click(function () {
                        var $chkbox = $(this);
                        var ischeck = $chkbox.prop('checked');
                        var checklist;
                        if (ischeck === false) {
                            checklist = ',' + $wrap.attr('checklist') + ',';
                            checklist = checklist.replace(',' + $chkbox.parent().parent().attr('keyvalue') + ',', ',');
                            $wrap.attr('checklist', checklist.substr(1, checklist.length - 2));
                        } else {
                            checklist = $wrap.attr('checklist');
                            if (!checklist) {
                                checklist = $chkbox.parent().parent().attr('keyvalue');
                            } else {
                                checklist += ',' + $chkbox.parent().parent().attr('keyvalue');
                            }
                            $wrap.attr('checklist', checklist);
                        }

                        var trIndex = $chkbox.parent().parent().parent().find('>tr').index($chkbox.parent().parent());
                        $wrap.find('>.dbody>.tbody>tbody>tr:eq(' + trIndex + ')').find('>td>input').prop('checked', ischeck)
                        $wrap.find('>.fdbody>.tbody>tbody>tr:eq(' + trIndex + ')').find('>td>input').prop('checked', ischeck)

                        //触发CheckBoxChanged事件
                        $wrap.triggerHandler("CheckBoxChanged");
                        $.each(ictr._rundata_.igvCheckBoxChanged, function () { this($wrap, $wrap.attr('checklist'), $wrap.attr('id'), $chkbox); });
                    });
                    $thead.find('>thead>tr:last>th:first>input[type="checkbox"]').off('click').click(function () {
                        var ischeck = $(this).prop('checked');
                        $wrap.find('.dhead>.thead>thead>tr:last>th:first>input[type="checkbox"]').prop("checked", ischeck);
                        $wrap.find('.fdhead>.thead>thead>tr:last>th:first>input[type="checkbox"]').prop("checked", ischeck);

                        $wrap.find('.dbody>.tbody>tbody>tr').find('>td:first>input[type="checkbox"]:not([disabled])').prop("checked", ischeck);
                        $wrap.find('.fdbody>.tbody>tbody>tr').find('>td:first>input[type="checkbox"]:not([disabled])').prop("checked", ischeck);

                        var checklist = ',' + $wrap.attr('checklist') + ',';
                        $tbody.find('>tbody>tr').each(function () {
                            var $thistr = $(this);
                            if ($thistr.find('>td:first>input[type="checkbox"]').length > 0) {
                                if (ischeck === "checked" || ischeck === true) {
                                    checklist += $thistr.attr('keyvalue') + ',';
                                } else {
                                    checklist = checklist.replace(',' + $thistr.attr('keyvalue') + ",", ',');
                                }
                            }
                        });
                        if (checklist.length > 1) checklist = checklist.substr(1, checklist.length - 2);
                        var arraychecklist = ArrayUniq(checklist.split(','));

                        checklist = '';
                        for (var i = 0; i < arraychecklist.length; i++) {
                            if (arraychecklist[i] !== '') checklist += ',' + arraychecklist[i];
                        }
                        if (checklist.length > 0) checklist = checklist.substr(1);
                        $wrap.attr('checklist', checklist);

                        //触发CheckBoxChanged事件
                        $wrap.triggerHandler("CheckBoxChanged");
                        $.each(ictr._rundata_.igvCheckBoxChanged, function () { this($wrap, $wrap.attr('checklist'), $wrap.attr('id'), null); });
                    });
                }
                //去除数组中的重复项
                function ArrayUniq(arr) {
                    var temp = {}, len = arr.length;
                    for (var i = 0; i < len; i++) {
                        if (typeof temp[arr[i]] === "undefined") temp[arr[i]] = 1;
                    }
                    arr.length = 0; len = 0;
                    for (var i in temp) arr[len++] = i;
                    return arr;
                }

                function iGridViewSort() {

                    $thead.find('>thead>tr>th.sort').off('click').click(function () {
                        var $this = $(this);
                        if ($wrap.attr('IsSpliting') === 'true') return;
                        var currentpage = $('#' + ctrID + '_TDPager').find('#currentpage').text();

                        var jo = getSortStatus();
                        if ($this.hasClass('none')) {
                            if (jo.s3) {
                                jo.s1 = jo.s2;
                                jo.s2 = jo.s3;
                                jo.s3 = { c: $this.attr('columnname'), s: 'asc' };
                            }
                            else if (jo.s2) {
                                jo.s3 = { c: $this.attr('columnname'), s: 'asc' };
                            }
                            else if (jo.s1) {
                                jo.s2 = { c: $this.attr('columnname'), s: 'asc' };
                            }
                            else {
                                jo.s1 = { c: $this.attr('columnname'), s: 'asc' };
                            }
                        }
                        else if ($this.hasClass('asc1')) {
                            jo.s1 = jo.s2;
                            jo.s2 = jo.s3;
                            if (jo.s2)
                                jo.s3 = { c: $this.attr('columnname'), s: 'desc' };
                            else if (jo.s1)
                                jo.s2 = { c: $this.attr('columnname'), s: 'desc' };
                            else
                                jo.s1 = { c: $this.attr('columnname'), s: 'desc' };
                        }
                        else if ($this.hasClass('asc2')) {
                            jo.s2 = jo.s3;
                            if (jo.s2)
                                jo.s3 = { c: $this.attr('columnname'), s: 'desc' };
                            else
                                jo.s2 = { c: $this.attr('columnname'), s: 'desc' };
                        }
                        else if ($this.hasClass('asc3')) {
                            jo.s3.s = 'desc';
                        }
                        else if ($this.hasClass('desc1')) {
                            jo.s1 = jo.s2;
                            jo.s2 = jo.s3;
                            jo.s3 = null;
                        }
                        else if ($this.hasClass('desc2')) {
                            jo.s2 = jo.s3;
                            jo.s3 = null;
                        }
                        else if ($this.hasClass('desc3')) {
                            jo.s3 = null;
                        }

                        var joStr = {};
                        if (jo.s1) joStr.s1 = jo.s1;
                        if (jo.s2) joStr.s2 = jo.s2;
                        if (jo.s3) joStr.s3 = jo.s3;

                        $wrap.attr('sortstring', $.toJsonString(joStr));

                        if ($wrap.attr("editmode") == "all" && $wrap.attr('saveedit') !== 'true') {
                            iGridViewSortByWeb();
                        } else {
                            $wrap.iGridView("buffer", currentpage);
                        }
                    });

                    function getSortStatus() {
                        var jo = {};
                        $thead.find('>thead>tr>th.sort').each(function () {
                            var $this = $(this);
                            if ($this.hasClass('none') === false) {
                                if ($this.hasClass('asc1')) {
                                    jo.s1 = { c: $this.attr('columnname'), s: 'asc' };
                                }
                                else if ($this.hasClass('asc2')) {
                                    jo.s2 = { c: $this.attr('columnname'), s: 'asc' };
                                }
                                else if ($this.hasClass('asc3')) {
                                    jo.s3 = { c: $this.attr('columnname'), s: 'asc' };
                                }
                                else if ($this.hasClass('desc1')) {
                                    jo.s1 = { c: $this.attr('columnname'), s: 'desc' };
                                }
                                else if ($this.hasClass('desc2')) {
                                    jo.s2 = { c: $this.attr('columnname'), s: 'desc' };
                                }
                                else if ($this.hasClass('desc3')) {
                                    jo.s3 = { c: $this.attr('columnname'), s: 'desc' };
                                }
                            }
                        });
                        return jo;
                    }
                }
            }

            function iGridViewSortByWeb() {

                setSortStatus();

                var jo = $.JsonObject($wrap.attr('sortstring'));
                var data = $wrap.iGridViewGetDT().Rows;

                var s1Col = "";
                var s1SortType = "";
                var s2Col = "";
                var s2SortType = "";
                var s3Col = "";
                var s3SortType = "";

                var sortWeight = {};
                if (jo.s1) {
                    s1Col = jo.s1.c;
                    s1SortType = jo.s1.s;
                    sortWeight['s1'] = { col: s1Col, w: getSortColWeightList(data, s1Col, s1SortType, 1000000) };
                }
                if (jo.s2) {
                    s2Col = jo.s2.c;
                    s2SortType = jo.s2.s;
                    sortWeight['s2'] = { col: s2Col, w: getSortColWeightList(data, s2Col, s2SortType, 1000) };
                }
                if (jo.s3) {
                    s3Col = jo.s3.c;
                    s3SortType = jo.s3.s;
                    sortWeight['s3'] = { col: s3Col, w: getSortColWeightList(data, s3Col, s3SortType, 1) };
                }

                RendorSortediGridViewRow(sortWeight, data);

                function getSortColWeightList(data, sCol, sSortType, WeightXS) {

                    var sSetList = [];
                    for (var i in data) {
                        var sColVal = data[i][sCol];
                        var sexist = false;
                        for (var j in sSetList) {
                            var sSetColVal = sSetList[j];
                            if (sSetColVal == sColVal) {
                                sexist = true;
                            }
                        }
                        sSetList.push([sColVal, data[i]]);
                    }
                    if (sSortType == "asc") {
                        sSetList.sort(function (a, b) { return a[0] > b[0] ? 1 : (a[0] == b[0] ? 0 : -1); });
                    } else {
                        sSetList.sort(function (a, b) { return a[0] > b[0] ? -1 : (a[0] == b[0] ? 0 : 1); });
                    }
                    sSetWeightList = [];
                    for (var i in sSetList) {
                        var sSetColVal = sSetList[i][0];
                        var data = sSetList[i][1];
                        var isblank = true;
                        for (var key in data) {
                            if (key != "_extvalue" && key != "_keyvalue" && key != "_lineno" && key != "_rowindex" && key != "_seqkey") {
                                if (data[key] != null && data[key] != "") {
                                    isblank = false;
                                }
                            }
                        }
                        var sWeight = 0;
                        if (isblank) {
                            sWeight = 999999999;
                        } else {
                            sWeight = WeightXS * (parseInt(i) + 1);
                        }

                        sSetWeightList.push([sSetColVal, sWeight]);
                    }
                    return sSetWeightList;
                }

                function RendorSortediGridViewRow(swobj, igvdata) {

                    $.each(igvdata, function (_idx, trdata) {

                        var priority = 0;
                        if (swobj.s1) {
                            var colValue = trdata[swobj.s1.col];
                            $.each(swobj.s1.w, function (_idx, val_Weight) {
                                if (val_Weight[0] == colValue) {
                                    priority += val_Weight[1];
                                    return false;
                                }
                            })
                        }
                        if (swobj.s2) {
                            var colValue = trdata[swobj.s2.col];
                            $.each(swobj.s2.w, function (_idx, val_Weight) {
                                if (val_Weight[0] == colValue) {
                                    priority += val_Weight[1];
                                    return false;
                                }
                            })
                        }

                        if (swobj.s3) {
                            var colValue = trdata[swobj.s3.col];
                            $.each(swobj.s3.w, function (_idx, val_Weight) {
                                if (val_Weight[0] == colValue) {
                                    priority += val_Weight[1];
                                    return false;
                                }
                            })
                        }

                        trdata['_sort_priority'] = priority;
                    });

                    igvdata.sort(function (a, b) {
                        return a._sort_priority - b._sort_priority;
                    });

                    var fragment = document.createDocumentFragment();
                    $.each(igvdata, function (_idx, trdata) {
                        var seqkey = trdata._seqkey;
                        //DOM
                        $wrap.iGridViewGetRows().each(function () {
                            if ($(this).attr('_seqkey') == seqkey) {
                                fragment.appendChild(this);
                            }
                        })
                    })

                    $wrap.find(">.dbody>.tbody>tbody")[0].appendChild(fragment);
                    $wrap.iGridViewFreezeTable();

                }

                function setSortStatus() {
                    var jo = $.JsonObject($wrap.attr('sortstring'));
                    $thead.find(">thead>tr>th.sort[columnname]").removeClass("none").removeClass("asc1").removeClass("asc2").removeClass("asc3").removeClass("desc1").removeClass("desc2").removeClass("desc3");

                    if (jo.s1) {
                        $thead.find(">thead>tr>th.sort[columnname=" + jo.s1.c + "]").addClass(jo.s1.s + "1");
                    }
                    if (jo.s2) {
                        $thead.find(">thead>tr>th.sort[columnname=" + jo.s2.c + "]").addClass(jo.s2.s + "2");
                    }
                    if (jo.s3) {
                        $thead.find(">thead>tr>th.sort[columnname=" + jo.s3.c + "]").addClass(jo.s3.s + "3");
                    }

                    $thead.find(">thead>tr>th.sort[columnname]").each(function () {
                        var $th = $(this);
                        if (!$th.hasClass('none') && !$th.hasClass("asc1") && !$th.hasClass("asc2") && !$th.hasClass("asc3") && !$th.hasClass("desc1") && !$th.hasClass("desc2") && !$th.hasClass("desc3"))
                            $th.addClass('none');
                    })
                }
            }

            function BindPagerEvent() {
                var $dpagerinfo = $wrap.find('.dpagerinfo');
                $dpagerinfo.find('.nextpage').off('click').click(function () {
                    if (parseInt($wrap.attr('PageNo')) + 1 <= parseInt($wrap.attr('PageCount'))) {
                        $wrap.iGridView("buffer", parseInt($wrap.attr('PageNo')) + 1);
                    }
                });

                $dpagerinfo.find('.prepage').off('click').click(function () {
                    if (parseInt($wrap.attr('PageNo')) - 1 > 0) {
                        $wrap.iGridView("buffer", parseInt($wrap.attr('PageNo')) - 1);
                    }
                });

                $dpagerinfo.find('.firstpage').off('click').click(function () {
                    $wrap.iGridView("buffer", 1);
                });

                $dpagerinfo.find('.lastpage').off('click').click(function () {
                    $wrap.iGridView("buffer", parseInt($wrap.attr('PageCount')));
                });

                $dpagerinfo.find('.btngo').off('click').click(function () {
                    var pageno = $dpagerinfo.find('.pageno').val();
                    if (parseInt("1" + pageno) != "1" + pageno) {
                        pageno = $wrap.attr('PageNo');
                        $dpagerinfo.find('.pageno').val(pageno);
                        return;
                    }
                    $wrap.iGridView("buffer", pageno);
                });

                $dpagerinfo.find('.selectpage').off('change').change(function () {
                    var pageno = $dpagerinfo.find('.selectpage').val();
                    $wrap.iGridView("buffer", pageno);
                });
            }

            function iGridViewMouseup(event) {
                event = event || window.event;

                $("body").unbind("mousemove").unbind("mouseup").unbind("selectstart");
                if (_miss_fun._iGridViewlineMove === true) {
                    _miss_fun._iGridViewlineMove = false;
                    var pos = _miss_fun._iGridViewcurrTh.offset();
                    var newWidth = event.clientX - pos.left;
                    if (newWidth > 0) {
                        var columnname = _miss_fun._iGridViewcurrTh.attr('columnname');
                        $wrap.iGridViewSetColumnWidth(columnname, newWidth);
                    }
                    setTimeout(function () {
                        $wrap.attr('IsSpliting', 'false');
                    }, 300);
                }
            }

            function openColumnMenu(evt, $this) {
                if ($wrap.attr('IsSpliting') === 'true') return;
                var currentpage = $('#' + ctrID + '_TDPager').find('#currentpage').text();

                evt = evt || window.event;

                var canSort = $this && $this.hasClass('sort');

                var m = [
                    { id: "_GridViewSortMenu_clear", title: lang("清除排序", "Clear Sort"), icon: 'delete' },
                    { id: "-" },
                    { id: "_GridViewSortMenu_asc", title: lang("按本列升序", "Sort in ascending by this column"), icon: 'goup', disabled: !canSort },
                    { id: "_GridViewSortMenu_desc", title: lang("按本列降序", "Sort in descending by this column"), icon: 'godown', disabled: !canSort },
                    { id: "-" },
                    { title: lang("导出", "Export"), child: [{ id: "_GridViewSortMenu_ExportX", title: "Excel", icon: "excel" }, { id: "_GridViewSortMenu_ExportP", title: "Pdf", icon: "pdf" }, { id: "_GridViewSortMenu_ExportH", title: "HTML", icon: "browser" }, { id: "_GridViewSortMenu_ExportV", title: "CSV", icon: "excel" },] },
                    { id: "-" },
                    { id: "_GridViewSortMenu_setwidth", title: lang("设置列宽", "Set Column Width"), icon: 'rightcolumn' },
                    { id: "_GridViewSortMenu_search", title: lang("搜索 ...", "Search..."), icon: 'search' },
                ];
                $.iMenus(m, evt, function (id) {
                    switch (id) {
                        case '_GridViewSortMenu_clear':
                            $wrap.attr('sortstring', '');
                            if ($wrap.attr("editmode") == "all" && $wrap.attr('saveedit') !== 'true') {
                                iGridViewSortByWeb();
                            } else {
                                $wrap.iGridView("buffer", currentpage);
                            }
                            break;
                        case '_GridViewSortMenu_asc':
                            if (!$this.attr('columnname')) return;
                            $wrap.attr('sortstring', $.toJsonString({ s1: { c: $this.attr('columnname'), s: 'asc' } }));
                            if ($wrap.attr("editmode") == "all" && $wrap.attr('saveedit') !== 'true') {
                                iGridViewSortByWeb();
                            } else {
                                $wrap.iGridView("buffer", currentpage);
                            }
                            break;
                        case '_GridViewSortMenu_desc':
                            if (!$this.attr('columnname')) return;
                            $wrap.attr('sortstring', $.toJsonString({ s1: { c: $this.attr('columnname'), s: 'desc' } }));
                            if ($wrap.attr("editmode") == "all" && $wrap.attr('saveedit') !== 'true') {
                                iGridViewSortByWeb();
                            } else {
                                $wrap.iGridView("buffer", currentpage);
                            }
                            break;
                        case '_GridViewSortMenu_setwidth':
                            if (!$this.attr('columnname')) return;
                            var jotab = {};
                            jotab.Title = lang("设置列宽", "Set Column Width");
                            var ctr1 = new ictr.iText('tabWidth');
                            ctr1.title = lang("列宽", "Width");
                            ctr1.TextType = ictr.iTextType.Integer;
                            ctr1.Value = $tbody.find('>colgroup>col[columnname="' + $this.attr('columnname') + '"]').attr('width').replace('px', '');
                            jotab.items = [ctr1];
                            openConfirm(jotab, function (ret) {
                                if (ret && ret.tabWidth) $wrap.iGridViewSetColumnWidth($this.attr('columnname'), ret.tabWidth);
                            });
                            break;
                        case '_GridViewSortMenu_ExportX':
                            $wrap.iGridView('exportXLS');
                            break;
                        case '_GridViewSortMenu_ExportV':
                            $wrap.iGridView('exportCsv');
                            break;
                        case '_GridViewSortMenu_ExportP':
                            $wrap.iGridView('exportPdf');
                            break;
                        case '_GridViewSortMenu_ExportH':
                            $wrap.iGridView('exportHtml');
                            break;
                        case '_GridViewSortMenu_search':
                            $wrap.iGridViewSearch();
                            break;
                    }
                });
                evt.returnValue = false;
                return false;
            }
        })
            .fail(function (xhr) {
                if ($wrap.attr('asyncmode') === 'true') return;
                var errmsg = 'iGridViewData调用失败, 无法连接服务器, status:' + xhr.statusText + '(' + xhr.status + '),readyState:' + xhr.readyState;
                openToast(errmsg);
                console.log(errmsg)
                $wrap.find('.iGridViewLoading').remove();//移除 loading
                $wrap.find('.Refresh').removeClass('fa-spin');
                if (callback) callback(errmsg, true);
            });

        //异步xmlhttprequest
        if (QueryMode === "actual" && $wrap.attr('asyncmode') === 'true') {
            setTimeout(function () {
                jqXhr.abort();
                $wrap.iGridViewWaitforLoadData(callback);
            }, 3000);
        }
    };

    $.fn.iGridViewGetGridKey = function () {
        var $wrap = $(this);
        if ($wrap.length !== 1) return '';

        var id = $wrap.attr('id') || "";
        var EntityName = $wrap.attr('EntityName') || '';
        var TagValue = $wrap.attr('TagValue') || '';

        if (id) id = '-' + id;
        if (EntityName) EntityName = '-' + EntityName;
        if (TagValue) TagValue = '-' + TagValue;

        var assembly = $wrap[0].ownerDocument.defaultView.svr._currentAssembly || svr._currentAssembly;

        return assembly + id + EntityName + TagValue;
    };

    // -- iGridView / iReport 异步加载数据
    $.fn.iGridViewWaitforLoadData = function (callback) {
        var $wrap = $(this);
        if ($wrap.attr('isloaded') === 'true') return;

        var GridKey = $wrap.iGridViewGetGridKey();

        var p = $.GetRemoteData("/api/common/getReportProcess?key=" + encodeURIComponent(GridKey));
        console.log(p);
        if (!p && p !== 0) {
            return;
        }
        else if (p.substr(0, 1) == 'E') {
            $wrap.find('.iGridViewLoading').remove();//移除 loading
            $wrap.find('.Refresh').removeClass('fa-spin');
            $wrap.ProgressBar(0);
            openAlert(p.substr(1));
            return;
        }
        else if (p.substr(0, 1) == 'V') {
            var hisID = p.substr(1);
            $wrap.iGridViewHistory(hisID, callback);
            $wrap.ProgressBar(1);
            return;
        }
        else {
            if (p.toString)
                $wrap.ProgressBar(parseFloat(p) + "%");
            setTimeout(function () {
                $wrap.iGridViewWaitforLoadData(callback);
            }, 3000);
        }
    };

    //查询按钮事件
    $.fn.iGridViewShowStrategy = function () {
        var $wrap = $(this);
        var ctrID = $wrap.attr('id');
        var url = "/Common/iControls/iGridView_Strategy?ctrID=" + ctrID;
        openDialog(url, 822, 515, function (retValue) {
            if (retValue) {
                var RowheadType = $wrap.attr('rowhead') || "defaultstyle";
                if (RowheadType != 'none') retValue.freezecols = retValue.freezecols * 1 + 1;
                if (retValue.PageSize) $wrap.attr('pagesize', retValue.PageSize);
                if (retValue.freezecols) $wrap.attr('fixcolumnnumber', retValue.freezecols);
                if (retValue.Columns) $wrap.attr('Columns', retValue.Columns);
                if (retValue.QueryArgs) $wrap.attr('queryargs', retValue.QueryArgs);
                $wrap.find('.dstrategy').attr('title', retValue.ItemDesc).attr('rawtext', retValue.ItemName).html(retValue.ItemName);
                $wrap.iGridView();
            }
        });
        return $wrap;
    };

    $.fn.iGridViewLoadDefaultStrategy = function () {
        var $wrap = $(this);
        var GrieKey = $wrap.iGridViewGetGridKey();
        var url = "/api/icontrols/iGridViewData/GetDefaultStrategy?GridKey=" + GrieKey;
        $.GetRemoteData(url, function (retValue) {
            retValue = $.JsonObject(retValue);
            if (retValue && retValue.ID) {
                var RowheadType = $wrap.attr('rowhead') || "defaultstyle";
                if (RowheadType != 'none') retValue.freezecols = retValue.freezecols * 1 + 1;
                if (retValue.PageSize) $wrap.attr('pagesize', retValue.PageSize);
                if (retValue.freezecols) $wrap.attr('fixcolumnnumber', retValue.freezecols);
                if (retValue.Columns) $wrap.attr('Columns', retValue.Columns);
                if (retValue.QueryArgs) $wrap.attr('queryargs', retValue.QueryArgs);
                $wrap.find('.dstrategy').attr('title', retValue.ItemDesc).attr('rawtext', retValue.ItemName).html(retValue.ItemName);
            }
            $wrap.iGridView();
        });
        return $wrap;
    };

    $.fn.iGridViewAddButton = function (icon, title, clickFun) {
        var $wrap = $(this);

        var $btn = $('<div class="iGridViewButton editButton xicon-' + icon + '" title="' + EncodeHtml(title) + '"></div>');
        $btn.click(function () {
            clickFun($wrap);
        })
        $btn.insertBefore($wrap.find('.dstrategy'))
    }

    //从Excel导入功能
    $.fn.iGridViewImportExcel = function () {
        var $wrap = $(this);
        if (!$wrap.attr('importtype')) {
            openAlert(lang('当前表格不支持导入！', 'This grid does not support import!'));
            return;
        }
        var url = "/Common/iControls/iGridView_Import?ctrID=" + $wrap.attr('id');
        openDialog(url, function (retValue) {
            if ($wrap.attr('importtobuffer') == 'true') {
                $wrap.iGridView('buffer');
            }
            else {
                $wrap.iGridView();
            }
        });
        return $wrap;
    };

    $.fn.iGridViewSetChecklist = function (checklists) {
        var $wrap = $(this);
        if ($wrap.attr('rowhead') != 'checkbox') return $wrap;

        if (arguments.length === 0 || checklists === undefined || checklists === null) {
            checklists = $wrap.attr('checklist') || '';
        }
        else if (checklists === true) {
            checklists = setAll();
            $wrap.attr('checklist', checklists);
        }
        else if (checklists === false) {
            $wrap.attr('checklist', '');
            checklists = '';
        }
        else
            $wrap.attr('checklist', checklists);

        var $tbody = $wrap.find('.dbody>table>tbody');
        var $ftbody = $wrap.find('.fdbody>table>tbody');

        var keyvalues = (checklists || '').split(',');

        $tbody.find('>tr').find('>td:first>input[type="checkbox"]').prop("checked", false);
        $ftbody.find('>tr').find('>td:first>input[type="checkbox"]').prop("checked", false);

        for (var i = 0; i < keyvalues.length; i++) {
            if (keyvalues[i] !== '') {
                $tbody.find('>tr[keyvalue="' + keyvalues[i] + '"]').find('>td:first>input[type="checkbox"]').prop("checked", true);
                $ftbody.find('>tr[keyvalue="' + keyvalues[i] + '"]').find('>td:first>input[type="checkbox"]').prop("checked", true);
            }
        }
        var isallcheck = "1";

        $tbody.find('>tr').each(function () {
            var $chkBox = $(this).find('>td:first>input[type="checkbox"]');
            if ($chkBox.prop('checked') === false) isallcheck = "0";
        });

        $wrap.find('>.dhead>.thead>thead>tr:last>th:first>input[type="checkbox"]').prop("checked", isallcheck === "1");
        $wrap.find('>.fdhead>.thead>thead>tr:last>th:first>input[type="checkbox"]').prop("checked", isallcheck === "1");

        //触发CheckBoxChanged事件
        $wrap.triggerHandler("CheckBoxChanged");
        $.each(ictr._rundata_.igvCheckBoxChanged, function () { this($wrap, $wrap.attr('checklist') || '', $wrap.attr('id') || '', false); });

        return $wrap;

        function setAll() {
            var checklist = '';
            $wrap.find('>.dbody>.tbody>tbody>tr').each(function () {
                var $thistr = $(this);
                if ($thistr.find('>td:first>input[type="checkbox"]').length > 0) {
                    checklist += ',' + $thistr.attr('keyvalue');
                }
            });
            if (checklist) checklist = checklist.substr(1);
            return checklist;
        }
    };

    //插入行
    $.fn.iGridViewInsertRow = function (isAfter) {
        var $wrap = $(this);
        var ctrID = $wrap.attr('id');
        var $tbody = $wrap.find('.dbody>.tbody>tbody');

        var activedRow = $tbody.find(">tr[activated='true']:first");
        if (activedRow.length == 0) {
            openAlert(lang('请选择插入行的位置！', 'Please select the position of the insert row!'), 3000);
            return null;
        }
        var columnCount = $wrap.find('.dbody>.tbody>colgroup>col').length;

        var seqkey = 0;
        $wrap.iGridViewGetRows().each(function () {
            if (seqkey < $.toNumber($(this).attr('_seqkey')))
                seqkey = $.toNumber($(this).attr('_seqkey'));
        });
        var NewRow = "<tr _seqkey='" + (seqkey + 1) + "'>";

        var $firstTR = $tbody.find('>tr:first');
        var style = $firstTR.find('>td[i="0"]').attr('style') || '';
        if (style) style = ' style="' + style + '"';

        var rowhead = $wrap.attr('rowhead');
        if (rowhead === 'lineno' || rowhead === 'lineno10') {
            var index2 = activedRow.find('>td:first').text();

            var $prevrow, index1;

            if (isAfter) {
                $prevrow = activedRow.next();
                index1 = $prevrow.length === 1 ? $prevrow.find('>td:first').text() : (parseInt(index2) + (rowhead === 'lineno' ? 2 : 20));
            }
            else {
                $prevrow = activedRow.prev();
                index1 = $prevrow.length === 1 ? $prevrow.find('>td:first').text() : '0';
            }

            var index3 = Math.floor((parseInt(index2) + parseInt(index1)) / 2);
            NewRow += "<td i='0' rowhead='" + rowhead + "'" + style + ">" + index3 + "</td>";
        }
        else if (rowhead !== 'none') {
            NewRow += "<td i='0' rowhead='" + rowhead + "'" + style + ">&nbsp;</td>";
        }
        for (var i = 1; i < columnCount; i++) {
            style = $firstTR.find('>td[i="' + i + '"]').attr('style') || '';
            if (style) style = ' style="' + style + '"';
            NewRow += "<td i='" + i + "'" + style + ">&nbsp;</td>";
        }
        NewRow += "</tr>";

        if (isAfter)
            $(NewRow).insertAfter(activedRow);
        else
            $(NewRow).insertBefore(activedRow);

        //重新添加td点击事件
        var tdScript = $('#' + ctrID + "_HiddenScript").val();
        if (tdScript) eval(tdScript);

        //复制整个HTML到遮盖层
        $wrap.iGridViewFreezeTable();

        $wrap.iGridViewSetMoveColor();
        var count = parseInt($wrap.attr('RowCount')) + 1;
        $wrap.attr('RowCount', count);

        if (lang.isEn())
            $wrap.find('.pageinfo').text(count + ' rows');
        else
            $wrap.find('.pageinfo').text('共' + count + '条');
        //重新规划列宽
        _miss_fun.iGridViewOptimizeWidth($wrap);
        _miss_fun.iGridViewBuildPartner($wrap);
        if (isAfter)
            return activedRow.next();
        else
            return activedRow.prev();
    };

    //新增行
    $.fn.iGridViewAddRow = function () {
        var $wrap = $(this);
        var ctrID = $wrap.attr('id');
        var columnCount = $wrap.find('.dbody>.tbody>colgroup>col').length;

        var seqkey = 0;
        $wrap.iGridViewGetRows().each(function () {
            if (seqkey < $.toNumber($(this).attr('_seqkey')))
                seqkey = $.toNumber($(this).attr('_seqkey'));
        });
        var NewRow = "<tr _seqkey='" + (seqkey + 1) + "'>";

        var $tbody = $wrap.find('.dbody>.tbody>tbody');
        var maxRowIndex = '', step = '';
        var rowhead = $wrap.attr('rowhead');
        if (rowhead === 'lineno' || rowhead === 'lineno10') {
            maxRowIndex = $tbody.find('>tr:last>td:first').text();
            maxRowIndex = maxRowIndex === '' ? '0' : maxRowIndex;
            step = rowhead === 'lineno' ? 1 : 10;
        }

        var $firstTR = $tbody.find('>tr:first');
        var style = $firstTR.find('>td[i="0"]').attr('style') || '';
        if (style) style = ' style="' + style + '"';
        if (step) {
            maxRowIndex = parseInt(maxRowIndex) + step;
            NewRow += "<td i='0' rowhead='" + rowhead + "'" + style + ">" + maxRowIndex + "</td>";
        }
        else if (rowhead == 'checkbox') {
            NewRow += "<td i='0' rowhead='" + rowhead + "'" + style + "><input type=\"checkbox\" /></td>";
        }
        else {
            NewRow += "<td i='0' rowhead='" + rowhead + "'" + style + ">&nbsp;</td>";
        }

        for (var i = 1; i < columnCount; i++) {
            style = $firstTR.find('>td[i="' + i + '"]').attr('style') || '';
            if (style) style = ' style="' + style + '"';
            NewRow += "<td i='" + i + "'" + style + ">&nbsp;</td>";
        }
        NewRow += "</tr>";
        $tbody.append(NewRow);
        //重新添加td点击事件
        var tdScript = $('#' + ctrID + "_HiddenScript").val();
        if (tdScript) eval(tdScript);

        //复制整个HTML到遮盖层
        $wrap.iGridViewFreezeTable();

        $wrap.iGridViewSetMoveColor();
        var d_body = $wrap.find('.dbody')[0];
        d_body.scrollTop = d_body.scrollHeight;
        var count = parseInt($wrap.attr('RowCount')) + 1;
        $wrap.attr('RowCount', count);

        if (lang.isEn())
            $wrap.find('.pageinfo').text(count + ' rows');
        else
            $wrap.find('.pageinfo').text('共' + count + '条');
        //重新规划列宽
        _miss_fun.iGridViewOptimizeWidth($wrap);
        _miss_fun.iGridViewBuildPartner($wrap);
        return $tbody.find('>tr:last');;
    };

    //删除行
    $.fn.iGridViewDeleteRow = function ($deleteTr) {
        var $wrap = $(this);
        var $tr = $deleteTr || $wrap.iGridViewActiveRow();
        if ($tr.length == 0) {
            openAlert(lang(52), 3000);
            return;
        }

        if (ictr.iGridViewBeforeDeleteRow($tr, $wrap, $wrap.attr('id')) === false) return;

        if ($deleteTr) {
            removeTr();
        }
        else {
            openConfirm(lang(54), function (ret) {
                if (ret) {
                    removeTr();
                }
            });
        }

        return $wrap;

        function removeTr() {
            $tr.remove();
            //复制整个HTML到遮盖层
            $wrap.iGridViewFreezeTable();

            var count = parseInt($wrap.attr('RowCount')) - 1;
            $wrap.attr('RowCount', count);

            if (lang.isEn())
                $wrap.find('.pageinfo').text(count + ' rows');
            else
                $wrap.find('.pageinfo').text('共' + count + '条');


            //联动脚本=======iGridViewModified事件
            $.each(ictr._rundata_.igvModified, function () { this("", $(''), $(''), $wrap); });

            //iGridViewAfterModified事件
            $.each(ictr._rundata_.igvAfterModified, function () { this("", $(''), $wrap); });

            //set first row selected
            $wrap.iGridViewActiveRow(0);

            //重新计算合计行
            var actRow = $wrap.iGridViewActiveRow();
            _miss_fun.iGridViewCalcSumRow($wrap, actRow.parent().parent());

            //iGridView-Partner
            _miss_fun.iGridViewBuildPartner($wrap, null, actRow);

            _miss_fun.iGridViewBuildPartner($wrap);

            //2022-07-07 20:30  By Jason
            ictr.iGridViewAfterDeleteRow($tr, $wrap, $wrap.attr('id'));
        }
    };

    $.fn.iGridViewSetColumnWidth = function (columnname, newWidth) {
        var $wrap = $(this);

        var $thead = $wrap.find('.dhead>table');

        var $dbody = $wrap.find('.dbody');
        var $tbody = $dbody.find('>table');

        var $tsum = $wrap.find('.dsum>.tsum');

        $thead.find('>colgroup>col[columnname="' + columnname + '"]').attr('width', newWidth);
        $tbody.find('>colgroup>col[columnname="' + columnname + '"]').attr('width', newWidth);
        if ($tsum.length > 0) $tsum.find('>colgroup>col[columnname="' + columnname + '"]').attr('width', newWidth);

        //写入iGridView-Columns
        var columns = $.JsonObject($wrap.attr('columns'));
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].FieldName.replace(/\./g, '_') == columnname) {
                columns[i].Width = newWidth;
                $wrap.attr('columns', $.toJsonString(columns));
                break;
            }
        }
        //计算表格实际宽度（解决IE 10.0 bug）
        var tmpallwidth = 0;
        $tbody.find('>colgroup>col').each(function () {
            tmpallwidth += parseFloat($(this).attr('width'));
        });
        $tbody.width(tmpallwidth);
        if ($tsum) $tsum.width(tmpallwidth);

        $wrap.iGridViewFreezeTable();

        _miss_fun.iGridViewScroll($dbody);
    }

    $.fn.iGridViewFreezeTable = function () {
        var $wrap = $(this);
        if ($wrap.length === 0) return;
        else if ($wrap.length > 1) {
            $wrap.each(function () { $(this).iGridViewFreezeTable(); });
            return;
        }
        if ($wrap.attr('isDetail') === 'true') return;

        var freezecols = $wrap.attr('freezecols');
        if (!freezecols || !parseInt(freezecols)) return $wrap;

        if ($wrap.find('.thead').length === 0) return $wrap;

        if ($wrap.hasClass('flat')) return $wrap;

        if ($wrap.find('.fdhead').length === 0) {
            $wrap.append('<div class="fdhead"></div>');
            var overflowstyle = ($.browser.isPhone || $.browser.chrome) ? ' style="overflow-y:auto;"' : ''; //配合#box::-webkit-scrollbar { display: none; } 仅支持chrome
            $wrap.append('<div class="fdbody"' + overflowstyle + '></div>');
        } else {
            $wrap.find('.fdhead').empty();
            $wrap.find('.fdbody').empty().show();
        }

        var ColumnsWidth = 2;
        $wrap.find('.dhead>.thead>colgroup>col:lt(' + freezecols + ')').each(function () {
            ColumnsWidth += parseFloat($(this).attr('width'));
        });

        //设固定列头
        var FreezeHeadTable = $wrap.find('.dhead>.thead').clone(true);
        var FreezeHeadHeight = $wrap.find('.dhead').outerHeight();

        $wrap.find(".fdhead").css({ "width": ColumnsWidth + "px", "height": FreezeHeadHeight + "px" }).append(FreezeHeadTable);

        //设固定列行
        var freezeBodyTable = $wrap.find('.dbody>.tbody').clone(true);
        var FreezeBodyHeight = $wrap.find('.dbody').outerHeight() - 2;

        //检测是否有横向滚动条
        var _dbody = $wrap.find('.dbody')[0];
        var sl = _dbody.scrollLeft;
        _dbody.scrollLeft += sl > 0 ? -1 : 2;
        if (_dbody.scrollLeft !== sl) FreezeBodyHeight -= _dbody.offsetHeight - _dbody.clientHeight; //滚动条宽度
        _dbody.scrollLeft = sl;

        if (freezeBodyTable.length === 0)
            $wrap.find(".fdbody").hide();
        else {
            $wrap.find(".fdbody").css({ 'top': FreezeHeadHeight + "px", "width": ColumnsWidth + "px", "height": FreezeBodyHeight + "px" }).append(freezeBodyTable);
            var $dsum = $wrap.find('>.dsum');
            if ($dsum.length > 0 && $dsum.css('display') !== 'none') {
                $dsum.find('.fsum').remove();
                var sumTitle = $wrap.attr('SumTitle') || "∑";
                $dsum.append('<div class="fsum" style="width:' + (ColumnsWidth - 1) + 'px;">' + sumTitle + '</div>');
            }
        }
        return $wrap;
    };

    $.fn.iGridViewSetMoveColor = function () {
        var $wrap = $(this);
        if ($wrap.length === 0) return;
        else if ($wrap.length > 1) {
            $wrap.each(function () { $(this).iGridViewSetMoveColor(); });
            return;
        }

        var $dbody = $wrap.find('.dbody');

        //dblclick / click
        $dbody.find('.tbody>tbody>tr').off('hover').hover(
            function () {
                var rowindex = $(this).parent().find('>tr').index($(this));
                $wrap.find('.fdbody').find('.tbody>tbody>tr:eq(' + rowindex + ')').addClass('hover');
                $wrap.find('.dbody').find('.tbody>tbody>tr:eq(' + rowindex + ')').addClass('hover');
            },
            function () {
                var rowindex = $(this).parent().find('>tr').index($(this));
                $wrap.find('.dbody').find('.tbody>tbody>tr:eq(' + rowindex + ')').removeClass('hover');
                $wrap.find('.fdbody').find('.tbody>tbody>tr:eq(' + rowindex + ')').removeClass('hover');
            })
            .off('dblclick').dblclick(function () {
                var $tr = $(this);
                //触发RowDblClick事件
                $wrap.triggerHandler("RowDblClick", [$tr]);
                $.each(ictr._rundata_.igvDblclick, function () { this($wrap, $tr, $wrap.attr('id')); });
            })
            .off('click').click(function () {
                var $tr = $(this);
                $wrap.find('.dbody').find('.tbody>tbody>tr').removeAttr('activated');
                $wrap.find('.fdbody').find('.tbody>tbody>tr').removeAttr('activated');

                var rowindex = $tr.parent().find('>tr').index($tr);
                $wrap.find('.dbody').find('.tbody>tbody>tr:eq(' + rowindex + ')').attr('activated', 'true');
                $wrap.find('.fdbody').find('.tbody>tbody>tr:eq(' + rowindex + ')').attr('activated', 'true');

                $wrap.attr('selectedvalue', $tr.attr('keyvalue'));
                //触发RowClick事件
                $wrap.triggerHandler("RowClick", [$tr]);
                //iGridViewRowClick
                $.each(ictr._rundata_.igvRowclick, function () { this($wrap, $tr, $wrap.attr('id')); });
                //iGridView-Partner
                _miss_fun.iGridViewBuildPartner($wrap, null, $tr);
            });
        return $wrap;
    };

    $.fn.iGridViewBatchEdit = function (idx) {
        var $wrap = $(this);
        var ctrID = $wrap.attr('id');
        if (_miss_fun._iGridViewTDEdit_Columns['A' + ctrID] === undefined) return $wrap;
        $("body").mousedown();

        if (idx === undefined || idx === null) idx = 1;
        var url = "/html/iGridViewBatchEdit.html?ID=" + ctrID + "&fun=" + idx;
        openDialog(url, function (ret) {
            if (!ret) return;

            //batch import
            if (ret.indexOf('>>batch-import>>') === 0) {
                ret = ret.substr(16);
                setTimeout(function () { $wrap.iGridViewBatchImport(ret); }, 300);
                return;
            }

            var jo = $.JsonObject(ret);

            var $table = $('#' + ctrID + '>.dbody>.tbody');

            //查找columnName是第几列
            var $colgroup = $table.find(">colgroup");

            var cIndex = -1;
            var fieldtype = "string";
            $colgroup.find("col").each(function (ci) {
                if ($(this).attr('columnname') === jo.Edit.columnName) {
                    cIndex = ci;
                    fieldtype = $(this).attr('fieldtype');
                }
            });
            jo.Edit.cIndex = cIndex;
            jo.Edit.fieldtype = fieldtype;

            for (var i = 0; i < jo.Condition.length; i++) {
                cIndex = -1;
                fieldtype = "string";
                $colgroup.find("col").each(function (ci) {
                    if ($(this).attr('columnname') == jo.Condition[i].columnName) {
                        cIndex = ci;
                        fieldtype = $(this).attr('fieldtype');
                    }
                });
                jo.Condition[i].cIndex = cIndex;
                jo.Condition[i].fieldtype = fieldtype;
            }

            var stack = [];

            $table.find('>tbody>tr').each(function () {
                var $tr = $(this);
                var $td;
                var bOK = true;
                var tdValue;
                var cValue;
                var FieldType;
                var firsttdindex = $wrap.attr('rowhead') === 'none' ? 0 : 1;
                if ($.trim($tr.find('>td:eq(' + firsttdindex + ')').text()) == '') return true;

                for (var i = 0; i < jo.Condition.length; i++) {
                    var cond = jo.Condition[i];
                    $td = $tr.find('>td:eq(' + cond.cIndex + ')');
                    tdValue = $.trim($td.text());
                    FieldType = cond.fieldtype;
                    cValue = cond.Value1;

                    switch (cond.operater) {
                        case "等于":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) != $.toNumber(cValue)) bOK = false;
                            } else if (tdValue != cValue)
                                bOK = false;
                            break;
                        case "不等于":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) == $.toNumber(cValue)) bOK = false;
                            } else if (tdValue == cValue)
                                bOK = false;
                            break;
                        case "大于":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) <= $.toNumber(cValue)) bOK = false;
                            } else if (tdValue <= cValue)
                                bOK = false;
                            break;
                        case "小于":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) >= $.toNumber(cValue)) bOK = false;
                            } else if (tdValue >= cValue)
                                bOK = false;
                            break;
                        case "大于等于":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) < $.toNumber(cValue)) bOK = false;
                            } else if (tdValue < cValue)
                                bOK = false;
                            break;
                        case "小于等于":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) > $.toNumber(cValue)) bOK = false;
                            } else if (tdValue > cValue)
                                bOK = false;
                            break;
                        case "两者之间":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) < $.toNumber(cValue) || $.toNumber(tdValue) > $.toNumber(cond.Value2)) bOK = false;
                            } else if (tdValue < cValue || tdValue > cond.Value2) {
                                bOK = false;
                            }
                            break;
                        case "两者之外":
                            if (FieldType === "int" || FieldType === "float" || FieldType === "decimal") {
                                if ($.toNumber(tdValue) >= $.toNumber(cValue) || $.toNumber(tdValue) <= $.toNumber(cond.Value2)) bOK = false;
                            } else if (tdValue >= cValue && tdValue <= cond.Value2) {
                                bOK = false;
                            }
                            break;
                        case "空":
                            if (tdValue !== '') bOK = false;
                            break;
                        case "非空":
                            if (tdValue === '') bOK = false;
                            break;
                        case "列表中":
                            var bHas = false;
                            var ss = cValue.split(',');
                            for (var j = 0; j < ss.length; j++) {
                                var s = $.trim(ss[j]);
                                if (tdValue == s) {
                                    bHas = true;
                                    break;
                                }
                            }
                            if (!bHas) bOK = false;
                            break;
                        case "列表外":
                            var bHas = false;
                            var ss = cValue.split(',');
                            for (var j = 0; j < ss.length; j++) {
                                var s = $.trim(ss[j]);
                                if (tdValue == s) {
                                    bHas = true;
                                    break;
                                }
                            }
                            if (bHas) bOK = false;
                            break;
                        case "包含":
                            if (tdValue.indexOf(cValue) < 0) bOK = false;
                            break;
                        case "不包含":
                            if (tdValue.indexOf(cValue) >= 0) bOK = false;
                            break;
                        case "左包含":
                            if (tdValue.indexOf(cValue) != 0) bOK = false;
                            break;
                        case "右包含":
                            var reg = new RegExp(cValue + "$");
                            bOK = !(reg.test(tdValue));
                            break;
                    }
                    if (bOK == false) return true;
                }
                $td = $tr.find('>td:eq(' + jo.Edit.cIndex + ')');
                var value = $.trim($td.text());
                var cValue = $.toNumber(jo.Edit.Value1);
                switch (jo.Edit.operater) {
                    case "等于":
                        value = jo.Edit.Value1;
                        break;
                    case "加上":
                        value = $.toNumber(value) + cValue;
                        break;
                    case "减去":
                        value = $.toNumber(value) - cValue;
                        break;
                    case "乘以":
                        value = $.toNumber(value) * cValue;
                        break;
                    case "除以":
                        value = $.toNumber(value);
                        if (cValue == 0) value = 0;
                        else value = value / cValue;
                        break;
                }
                //$ctr.ival(value);
                //$("body").mousedown();
                stack.push({ td: $td, val: value });
            });

            var alltasks = stack.length;
            setTimeout(function () { runStack(stack); }, 300);
            function runStack(stack) {
                if (stack.length == 0) {
                    $wrap.ProgressBar(1);
                    $wrap.iGridViewFreezeTable();
                    _miss_fun.iGridViewBuildPartner($wrap);
                    return;
                }
                var task = stack.shift();
                var $td = task.td;
                $td.click();
                var $ctr = $td.find(">div");
                $ctr.ival(task.val);
                $("body").mousedown();

                var pbarwidth = ((alltasks - stack.length) / alltasks * 100) + "%";
                $wrap.ProgressBar(pbarwidth);
                setTimeout(function () { runStack(stack); }, 0);
            }
        });
        return $wrap;
    };

    $.fn.iGridViewBatchImport = function (data) {
        var $wrap = $(this);
        if (!data) return $wrap;

        if (ictr.iGridViewBeforeBatchImport($wrap, data) === false) return $wrap;

        var ctrID = $wrap.attr('id');

        var joEdit = _miss_fun._iGridViewTDEdit_Columns['A' + ctrID];
        if (!joEdit) return $wrap;
        $("body").mousedown();

        var $table = $wrap.find(">.dbody>.tbody");

        //查找columnName是第几列
        var $colgroup = $table.find(">colgroup");
        var colIndexes = getEditColumnIndex(joEdit, $colgroup);

        //append new row
        var $trs = $table.find('>tbody>tr');
        var alltrs = $trs.length;
        trIndex = -1;
        var firsttdindex = $wrap.attr('rowhead') === 'none' ? 0 : 1;
        $trs.each(function (i) {
            var $this = $(this);
            var val = $.trim($this.find('>td:eq(' + firsttdindex + ')').text());

            if (!val || val == "&nbsp;") {
                trIndex = i;
                return false;
            }
        });
        if (trIndex == -1) trIndex = alltrs;
        var sstemp = data.split('\n');
        var ss = [];
        for (var i = 0; i < sstemp.length; i++) {
            if (sstemp[i] && $.trim(sstemp[i])) ss.push(sstemp[i]);
        }

        var addtrs = ss.length - (alltrs - trIndex);
        if (addtrs > 0) appendRows($(this), addtrs)

        var stack = [];
        for (var i = 0; i < ss.length; i++) {
            var item = ss[i];
            if (!item || !$.trim(item)) continue;

            if (item[item.length - 1] === '\r') item = item.substr(0, item.length - 1);

            var ii = item.split('\t');

            var $tr = $table.find('>tbody>tr:eq(' + trIndex + ')');
            trIndex++;
            for (var j = 0; j < ii.length && j < joEdit.length; j++) {
                var val = $.trim(ii[j]);
                if (!val || val == '~') continue;
                var $td = $tr.find('>td:eq(' + colIndexes[j] + ')');
                stack.push({ td: $td, val: val });
            }
            stack.push({ tr: $tr, val: ii });
        }
        var alltasks = stack.length;
        $wrap.attr('isImporting', 'true');
        setTimeout(function () { runStack(stack); }, 0);
        return $wrap;

        function runStack(stack) {
            if (stack.length == 0) {
                $wrap.ProgressBar(1);
                $wrap.removeAttr('isImporting');
                //复制整个HTML到遮盖层
                $wrap.iGridViewFreezeTable();
                //重新规划列宽
                _miss_fun.iGridViewOptimizeWidth($wrap);
                //
                ictr.iGridViewBatchImported($wrap, data);

                _miss_fun.iGridViewBuildPartner($wrap);
                return;
            }
            var task = stack.shift();
            if (task.tr) {
                if (ictr._rundata_.igvBatchImporting.length > 0)
                    $.each(ictr._rundata_.igvBatchImporting, function () { this($wrap, task.tr, task.val); });
            }
            else {
                var $td = task.td;
                $td.click();
                var $ctr = $td.find(">div");

                if ($ctr.attr('ctrtype') === "iReference") $ctr.attr('isSettedValue', 'true');
                $ctr.ival(task.val);
                $("body").mousedown();

                var pbarwidth = ((alltasks - stack.length) / alltasks * 100) + "%";
                $wrap.ProgressBar(pbarwidth);
            }
            setTimeout(function () { runStack(stack); }, 0);
        }

        function appendRows($wrap, rowsCount) {
            var ctrID = $wrap.attr('id');
            var columnCount = $wrap.find('>.dbody>.tbody>colgroup>col').length;

            var $tab = $wrap.find('>.dbody>.tbody>tbody')

            var maxRowIndex = '', step = '';
            var rowhead = $wrap.attr('rowhead');
            if (rowhead === 'lineno' || rowhead === 'lineno10') {
                maxRowIndex = $tab.find('>tr:last>td:first').text();
                step = rowhead === 'lineno' ? 1 : 10;
            }
            var $firstTR = $tab.find('>tr:first');

            var style = $firstTR.find('>td[i="0"]').attr('style') || '';
            if (style) style = ' style="' + style + '"';

            var NewRow = "<tr>";
            if (step) {
                NewRow += "<td i='0'" + style + ">##head#row#index##</td>";
            }
            else
                NewRow += "<td i='0'" + style + ">&nbsp;</td>";

            for (var j = 1; j < columnCount; j++) {
                style = $firstTR.find('>td[i="' + j + '"]').attr('style') || '';
                if (style) style = ' style="' + style + '"';
                NewRow += "<td i='" + j + "'" + style + ">&nbsp;</td>";
            }
            NewRow += "</tr>";

            var NewRows = "";
            for (var i = 0; i < rowsCount; i++) {
                if (step) {
                    NewRows += NewRow.replace('##head#row#index##', parseInt(maxRowIndex) + step * (i + 1));
                }
                else {
                    NewRows += step ? (NewRow) : NewRow;
                }
            }

            $tab.append(NewRows);

            //重新添加td点击事件
            var tdScript = $('#' + ctrID + "_HiddenScript").val();
            if (tdScript != "") eval(tdScript);

            $wrap.iGridViewSetMoveColor();
            var d_body = $wrap.find('.dbody')[0];
            d_body.scrollTop = d_body.scrollHeight;
            var count = parseInt($wrap.attr('RowCount')) + rowsCount;
            $wrap.attr('RowCount', count);

            if (lang.isEn())
                $wrap.find('.pageinfo').text(count + ' rows');
            else
                $wrap.find('.pageinfo').text('共' + count + '条');
        }

        function getEditColumnIndex(joEdit, $colgroup) {
            var ss = [];
            for (var i = 0; i < joEdit.length; i++) {
                var colName = joEdit[i].columnName;
                var cIndex = 1;
                $colgroup.find("col").each(function (ci) {
                    if ($(this).attr('columnname') == colName) cIndex = ci;
                });

                ss.push(cIndex);
            }
            return ss;
        }
    };

    $.fn.iGridViewBuildGrid = function (data) {
        var $wrap = $(this);
        if (!data) return $wrap;

        var rows;
        if (data.constructor == Array)
            rows = data;
        else if (data.Rows)
            rows = data.Rows;
        else if (data.rows)
            rows = data.rows;

        if (!rows) return $wrap;

        var ctrID = $wrap.attr('id');
        var $tab = $wrap.find('>.dbody>.tbody>tbody')

        var step = '';
        var rowhead = $wrap.attr('rowhead');
        if (rowhead === 'lineno' || rowhead === 'lineno10') {
            step = rowhead === 'lineno' ? 1 : 10;
        }

        var columns = $.JsonObject($wrap.attr('columns'));
        var NewRow = "";

        for (var i = 0; i < rows.length; i++) {
            var keyvalue = rows[i]._keyvalue;
            if (keyvalue) keyvalue = ' keyValue="' + keyvalue + '"';
            var extvalue = rows[i]._extvalue;
            if (extvalue) extvalue = ' extValue="' + extvalue + '"';

            NewRow += '<tr' + keyvalue + extvalue + '>';
            var tdIdx = 0;
            if (step) {
                NewRow += '<td i="0" rowhead="lineno">' + (step * (i + 1)) + '</td>';
                tdIdx = 1;
            }
            else if (rowhead === 'normal') {
                NewRow += '<td i="0" rowhead="' + rowhead + '">&nbsp;</td>';
                tdIdx = 1;
            }
            else if (rowhead === 'checkbox') {
                NewRow += '<td i="0" rowhead="' + rowhead + '"><input type="checkbox" /></td>';
                tdIdx = 1;
            }

            for (var j = 0; j < columns.length; j++) {
                var c = columns[j];
                if (c.ColumnStatus == 'OnlyExport') continue;

                var style = '';
                if (c.Align && c.Align != 'auto') style = ' style="text-align:' + c.Align + ';"';
                var _rawvalue = rows[i][c.FieldName + '_rawvalue'] || '';
                if (_rawvalue) _rawvalue = ' _rawvalue="' + _rawvalue + '"';

                var val = rows[i][c.FieldName] || "&nbsp;";
                NewRow += '<td i="' + tdIdx + '"' + style + _rawvalue + '>' + val + '</td>';
                tdIdx++;
            }
            NewRow += "</tr>";
        }

        $tab.empty().append(NewRow);

        //重新添加td点击事件
        var tdScript = $('#' + ctrID + "_HiddenScript").val();
        if (tdScript) eval(tdScript);

        $wrap.iGridViewSetMoveColor();
        var d_body = $wrap.find('.dbody')[0];
        d_body.scrollTop = d_body.scrollHeight;
        var count = parseInt($wrap.attr('RowCount')) + rows.length;
        $wrap.attr('RowCount', count);

        if (lang.isEn())
            $wrap.find('.pageinfo').text(count + ' rows');
        else
            $wrap.find('.pageinfo').text('共' + count + '条');
    };

    $.fn.iGridViewSetMessage = function (html) {
        var $wrap = $(this);

        html = '<div style="padding:0px 10px; text-aligh:center; font-size:18px; color:red;">' + (html || '') + '</div>';

        $wrap.find('>.fdhead, >.fdbody').remove();
        $wrap.find('>.dfooter').empty();
        $wrap.find('>.dpager>.dpagerinfo').empty();
        $wrap.find('>.dhead').empty();
        $wrap.find('>.dbody').html(html);
        $wrap.find('>.dsum').empty();
    }

    $.fn.findTD = function (columnName) {
        var $tr = $(this);
        var $table = $tr.parent().parent();

        //查找columnName是第几列
        var $colgroup = $table.find(">colgroup");
        var cIndex = -1;
        $colgroup.find("col").each(function (ci) {
            if ($(this).attr('columnname') == columnName) {
                cIndex = ci;
                return false;
            }
        });
        if (cIndex == -1) return $('#_control_not_found');
        var $td = $tr.find(">td[i='" + cIndex + "']");
        while ($td.length === 0) {
            $tr = $tr.prev();
            if ($tr.length == 0) break;
            $td = $tr.find(">td[i='" + cIndex + "']");
        }
        return $td;
    };

    $.fn.iGridViewGetRows = function () {
        return $(this).find(">.dbody>.tbody>tbody>tr");
    };

    $.fn.iGridViewActiveRow = function (index) {
        var $this = $(this);
        if (arguments.length === 0) {
            return $this.find(">.dbody>.tbody>tbody>tr[activated]");
        }
        else {
            var rowcount = $this.find('>.dbody>.tbody>tbody>tr').length;
            index = index || 0;
            if (index > rowcount - 1) index = rowcount - 1;
            if (index < 0) index = 0;
            $this.find('>.dbody>.tbody>tbody>tr:eq(' + index + ')').click();
            return $this;
        }
    };

    $.fn.iGridViewColorFlag = function (colorFlag) {
        var ss = '';
        $.each(colorFlag, function (k, v) {

            ss += '<div class="PickerItem ' + k + '" style="font-size:12px; line-height:30px;">' + v + '</div>';
        })
        $(this).find('.iGridViewButton.colorFlag').attr('menu-trigger', 'mouseenter').show().iPicker(ss, 160);
    };

    $.fn.iGridViewGetExtValue = function () {
        return $.optimizeWhiteSpace($(this).find('.tbody>tbody>tr[activated="true"]:first').attr('extvalue') || '');
    }

    $.fn.GetTRData = function () {
        $tr = $(this);
        var $wrap = $tr.parent().parent().parent().parent();
        var $table = $wrap.find('>.dbody>.tbody');

        var row = {};
        row["_keyvalue"] = $tr.attr('keyValue') || '';
        row["_extvalue"] = $tr.attr('extValue') || '';
        if (($wrap.attr('rowhead') || '').indexOf('line') >= 0) row["_lineno"] = $tr.find(">td:first").text();
        if (hasCheckBox = $wrap.attr('rowhead') == 'checkbox') {
            var _checked = $tr.find(">td:first").find('input[type="checkbox"]').prop('checked');
            if (_checked === undefined) _checked = null;
            row["_checked"] = _checked;
        }

        var $cols = $table.find(">colgroup").find("col");
        $cols.each(function (colindex) {
            var $col = $(this);
            var cn = $col.attr('columnname');
            if (!cn) return true;


            var $td = $tr.find(">td[i='" + colindex + "']");

            if ($td.length === 0) {
                var $tr1 = $tr;
                while ($td.length === 0) {
                    $tr1 = $tr1.prev();
                    if ($tr1.length == 0) break;
                    $td = $tr1.find(">td[i='" + colindex + "']");
                }
            }

            if ($td.length === 1) {
                var tdVal = '';
                var $ctr = $td.find('>div');
                if ($ctr.length == 0) {
                    if ($td.attr('value-as-html'))
                        tdVal = $.trim($.optimizeWhiteSpace($td.html()));
                    else
                        tdVal = $.trim($.optimizeWhiteSpace($td.text()));
                }
                else {
                    tdVal = $ctr.ival();
                }

                if (!tdVal) {
                    var $ctr = $td.find('>div');
                    if ($ctr.length > 0) {
                        tdVal = $ctr.ival();
                    }
                    else {
                        var $ctr = $td.find('>input');
                        if ($ctr.length > 0) {
                            tdVal = $ctr.ival();
                        }
                    }
                }

                var fieldtype = $col.attr('fieldtype');
                if (fieldtype == 'decimal' || fieldtype == 'int') {
                    if (!tdVal) tdVal = null;
                    else tdVal = $.toNumber(tdVal, fieldtype == 'int');
                }

                row[cn] = tdVal;

                if ($col.attr('hasraw')) {
                    row[cn + '_rawValue'] = $.trim($.optimizeWhiteSpace($td.attr('_rawValue')));
                }
            }
            else {
                row[cn] = null;
            }
        });

        return row;
    };

    $.fn.iGridViewGetDT = function (KeepEditer, validateColName) {
        if (!KeepEditer) $("body").mousedown();
        var $table = $(this).find('>.dbody>.tbody');

        var ntable = new ictr.DataTable();
        ntable.addColumn("_rowindex:int").addColumn("_keyvalue").addColumn("_extvalue").addColumn("_seqkey:int");

        var hasLineNo = false;
        var hasCheckBox = false;

        if (($(this).attr('rowhead') || '').indexOf('line') >= 0) {
            hasLineNo = true;
            ntable.addColumn("_lineno");
        }
        else if ($(this).attr('rowhead') == 'checkbox') {
            hasCheckBox = true;
            ntable.addColumn("_checked:bool");
        }

        var rawCols = {};

        var colTypes = {};

        var $cols = $table.find(">colgroup").find("col");
        $cols.each(function (colindex) {
            var $col = $(this);
            var cn = $col.attr('columnname');
            if (cn) {
                var fieldtype = $col.attr('fieldtype');
                colTypes[cn] = fieldtype;
                ntable.addColumn(cn + ":" + fieldtype);
                if ($col.attr('hasraw')) {
                    ntable.addColumn(cn + "_rawValue");
                    rawCols[cn] = 1;
                }
            }
        });

        $table.find(">tbody>tr").each(function (i) {
            $tr = $(this);
            var row = {};
            row["_rowindex"] = i.toString();
            row["_keyvalue"] = $tr.attr('keyValue') || '';
            row["_extvalue"] = $tr.attr('extValue') || '';
            row["_seqkey"] = $tr.attr('_seqkey') || '';
            if (hasLineNo) row["_lineno"] = $tr.find(">td:first").text();
            if (hasCheckBox) {
                var _checked = $tr.find(">td:first").find('input[type="checkbox"]').prop('checked');
                if (_checked === undefined) _checked = null;
                row["_checked"] = _checked;
            }

            $cols.each(function (colindex) {
                var cn = $(this).attr('columnname');
                if (cn) {
                    var $td = $tr.find(">td[i='" + colindex + "']");

                    if ($td.length === 0) {
                        var $tr1 = $tr;
                        while ($td.length === 0) {
                            $tr1 = $tr1.prev();
                            if ($tr1.length == 0) break;
                            $td = $tr1.find(">td[i='" + colindex + "']");
                        }
                    }

                    if ($td.length === 1) {
                        var tdVal = '';
                        if (KeepEditer) {
                            var $ctr = $td.find('>div');
                            if ($ctr.length == 0) {
                                if ($td.attr('value-as-html'))
                                    tdVal = $.trim($.optimizeWhiteSpace($td.html()));
                                else
                                    tdVal = $.trim($.optimizeWhiteSpace($td.text()));
                            }
                            else {
                                tdVal = $ctr.ival();
                            }
                        }
                        else {
                            if ($td.attr('value-as-html'))
                                tdVal = $.trim($.optimizeWhiteSpace($td.html()));
                            else
                                tdVal = $.trim($.optimizeWhiteSpace($td.text()));
                        }
                        if (!tdVal) {
                            var $ctr = $td.find('>div');
                            if ($ctr.length > 0) {
                                tdVal = $ctr.ival();
                            }
                            else {
                                var $ctr = $td.find('>input');
                                if ($ctr.length > 0) {
                                    tdVal = $ctr.ival();
                                }
                            }
                        }

                        var dtype = colTypes[cn];

                        if (dtype == 'decimal' || dtype == 'int') {
                            if (!tdVal) tdVal = null;
                            else tdVal = $.toNumber(tdVal, dtype == 'int');
                        }

                        row[cn] = tdVal;

                        if (rawCols[cn]) {
                            row[cn + '_rawValue'] = $.trim($.optimizeWhiteSpace($td.attr('_rawValue')));
                        }
                    }
                    else {
                        row[cn] = null;
                    }
                }
            });

            if (!validateColName
                || validateColName.toString().toLowerCase() === 'bychecklist' && row['_checked']
                || row[validateColName])
                ntable.addRow(row);
        });
        return ntable;
    };

    $.fn.iGridViewGetSum = function (sumColName, validateColName) {
        var sum = 0;
        var d = $(this).iGridViewGetDT(true, validateColName);
        for (var i = 0; i < d.Rows.length; i++) {
            sum += $.toNumber(d.Rows[i][sumColName]);
        }
        return $.optimizeNumber(sum);
    };

    $.fn.iGridViewGetColumnVals = function (ColName, validateColName) {
        var ret = [];
        var d = $(this).iGridViewGetDT(true, validateColName);
        for (var i = 0; i < d.Rows.length; i++) {
            ret.push(d.Rows[i][ColName]);
        }
        return ret;
    };

    //自适应窗体大小
    $.fn.iGridViewResizeform = function (bottomHeight) {
        var $wrap = $(this);
        var IsiOS = $.browser.ios;
        $(document).ready(function () {
            resizeform($wrap, bottomHeight);
            setTimeout(function () { resizeform($wrap, bottomHeight); }, 300)
        });
        $(window).resize(function () {
            resizeform($wrap, bottomHeight);
        });
        return $wrap;

        function resizeform($iGridView, bottomHeight) {
            //----------------------------------------
            //处理dvQueryCondition
            if (document.getElementById('dvQueryCondition')) {
                var $dvQC = $('#dvQueryCondition').removeClass('width100P');
                if ($.trim($dvQC.html()) && ($dvQC.offset().top > 20 || $.browser.isPhone)) //转到第二行了
                {
                    $dvQC.addClass('width100P');
                    if ($.browser.isPhone && !$dvQC.hasClass('row')) {
                        $dvQC.addClass('row');
                        $dvQC.wrap('<div class="container grid"></div>');
                        $dvQC.find('.iItem-wrap').wrap('<div class="col-sm-12"></div>');
                        $dvQC.find('.iItem-Title').css('width', '94px');
                        $dvQC.find('.iItem-Content').css('width', '100%');
                        $dvQC.find('[ctrtype]').css('width', '100%');
                        $dvQC.parent().append('<div id="dvSplitCondAndGrid" style="height:14px; border:1px solid #ddd; text-align:center; width:100%; float:left; cursor:point; margin-top:2px;"><span class="xiconfont xicon-up fa-rotate-trans" style="padding-right:6px;"></span></div>')

                        if ($dvQC.outerHeight() + $dvQC.offset().top + 18 > innerHeight) {
                            $dvQC.outerHeight(innerHeight - $dvQC.offset().top - 18).css('overflow', 'scroll');
                        }

                        $('#dvSplitCondAndGrid').off('click').click(function () {
                            $('#dvSplitCondAndGrid').find('>span').toggleClass('fa-rotate-180');
                            $dvQC.slideToggle({
                                progress: function () { resizeformCtrl($iGridView, bottomHeight); },
                                complete: function () { resizeformCtrl($iGridView, bottomHeight); }
                            });
                        });
                    }
                    else {
                        $dvQC.parent().find('.expandicon').show().off('click').click(function () {
                            $dvQC.parent().find('.expandicon>span').toggleClass('fa-rotate-180');
                            $dvQC.slideToggle({
                                progress: function () { resizeformCtrl($iGridView, bottomHeight); },
                                complete: function () { resizeformCtrl($iGridView, bottomHeight); }
                            });
                        });
                    }
                }
                else {
                    $dvQC.parent().find('.expandicon').hide();
                }
            }
            //----------------------------------------
            resizeformCtrl($iGridView, bottomHeight);
        }

        function resizeformCtrl($dv, bottomHeight) {
            var ctrType = $dv.attr('ctrtype');
            var decSize = $dv.offset().top + 6;
            if (bottomHeight) decSize += bottomHeight;
            if (ctrType === 'iGridView' || ctrType === 'iReport') {
                decSize += IsiOS ? 6 : 1;
                $dv.iCtrSetHeight(window.innerHeight - decSize);
            }
            else {
                $dv.outerHeight(window.innerHeight - decSize);
                $dv.find('dv[ctrtype="iGridView"],dv[ctrtype="iReport"]').iCtrSetHeight();
            }
        }
    };

    $.fn.iGridViewSearch = function (searchString) {
        var $this = $(this);
        if (searchString) {
            $this.attr('_directSearchString', searchString).iGridView('buffer');
            return;
        }
        openDialog('/html/SearchCondition.html', function (ret) {
            if (!ret) return;
            $this.attr('_directSearchString', ret).iGridView('buffer');
        });
    }

    $.fn.iCtrSetHeight = function (value) {
        var $wrap = $(this);
        if ($wrap.length === 0) return $wrap;
        else if ($wrap.length > 1) {
            $wrap.each(function () { $(this).iCtrSetHeight(value); });
            return $wrap;
        }

        var ctrtype = $wrap.attr('ctrtype');
        if (ctrtype !== 'iReport' && ctrtype !== 'iGridView' && ctrtype !== 'iPanel') {
            $wrap.find('div[ctrtype="iGridView"],div[ctrtype="iReport"],div[ctrtype="iPanel"]').each(function () { $(this).iCtrSetHeight(value); });
            return $wrap;
        }

        if ((arguments.length === 0 || !value) && $wrap.attr('AutoHeight') === 'true' && $wrap.attr('isDetail') !== 'true'
            || value === -1) {
            var $dbody = $wrap.find('.dbody');

            var $dhead = $wrap.find('.dhead')
            var $dsum = $wrap.find('.dsum');
            var $dpager = $wrap.find('.dpager');
            var $dfooter = $wrap.find('.dfooter');

            var h = $dbody.find('>.tbody').outerHeight() + 1;

            if ($dhead.length > 0) h += $dhead.outerHeight();
            if ($dpager.length > 0 && $dpager.css('display') !== "none") h += $dpager.outerHeight();
            if ($dfooter.length > 0 && $dfooter.css('display') !== "none") h += $dfooter.outerHeight();
            if ($dsum.length > 0 && $dsum.css('display') !== "none") h += $dsum.outerHeight();
            var sbw = $wrap.find('>.dbody').ScrollBarWidth();
            if (sbw == 0) {
                var colwidth = 0;
                $dbody.find('col').each(function () { colwidth += parseInt($(this).attr('width').replace('px', '')) });
                if (colwidth > $wrap.width() - 2) {
                    sbw = 12;
                }
            }
            h += sbw;
            value = h;
            $wrap.outerHeight(value);
        }
        else if (arguments.length === 0 || !value) {
            value = $wrap.outerHeight();
        }
        else {
            $wrap.outerHeight(value);
        }

        if (ctrtype == 'iPanel') {
            if ($wrap.find('>.iPanel-Header>.xicon-menuup1').length == 0) return $wrap;
            if ($wrap.attr('autoheight') == 'true') return $wrap;
            var diffHeight = 32;
            if ($wrap.find('>.iPanel-Footer').length > 0) {
                diffHeight += $wrap.find('>.iPanel-Footer').outerHeight();
            }
            $wrap.removeClass('autoheight').find('>.iPanel-Content').outerHeight($wrap.outerHeight() - diffHeight);
        }
        else if (ctrtype === 'iReport' || ctrtype === 'iGridView') {

            var $dpager = $wrap.find('.dpager');
            var $dfooter = $wrap.find('.dfooter');
            if ($dpager.length > 0 && $dpager.css('display') !== "none") value -= $dpager.outerHeight();
            if ($dfooter.length > 0 && $dfooter.css('display') !== "none") {
                value -= $dfooter.outerHeight();
                $dpager.css('bottom', $dfooter.css('height'));
            }
            else {
                $dpager.css('bottom', '0px');
            }
            value -= 1;

            if ($wrap.attr('isDetail') === 'true') {
                $wrap.find('.iGridView-Partner').css('height', value);
                setiGridViewPagerMenu($wrap);
            }
            else {
                if ($wrap.hasClass('flat')) {
                    $wrap.find('>.dhead,>.fdhead,>.fdbody,>.dfooter,>.dpager').remove();
                }

                var $dhead = $wrap.find('.dhead')
                var $dsum = $wrap.find('.dsum');

                if ($dhead.length > 0) value -= $dhead.outerHeight();
                if ($dsum.length > 0 && $dsum.css('display') !== "none") value -= $dsum.outerHeight();

                $wrap.find('.dbody').css('height', value);
                $wrap.find('.igvTemplate').css('height', value);

                if (ctrtype === 'iReport')
                    $wrap.iReportZoom();
                else if (ctrtype === 'iGridView') {
                    $wrap.iGridViewFreezeTable();
                    setiGridViewPagerMenu($wrap);
                }
            }
        }
        return $wrap;

        function setiGridViewPagerMenu($wrap) {
            var $pagerinfo = $wrap.find('.dpagerinfo');
            if ($.browser.isPhone) return;

            if ($wrap.width() < 480) {
                $pagerinfo.find('.iGridViewButton,.gopage').hide();

                var joPageFirst = { id: 'menupager_0', title: '首页FirstPage', icon: 'page_first' };
                var joPagePrev = { id: 'menupager_1', title: '前一页PreviousPage', icon: 'page_previous' };
                var joPageNext = { id: 'menupager_2', title: '后一页NextPage', icon: 'page_next' };
                var joPageLast = { id: 'menupager_3', title: '末页LastPage', icon: 'page_end' };
                if ($wrap.attr('PageNo') === '1') {
                    joPageFirst.disabled = joPagePrev.disabled = 'true';
                }
                if ($wrap.attr('PageNo') === $wrap.attr('PageCount')) {
                    joPageNext.disabled = joPageLast.disabled = 'true';
                }
                var joPageMenu = [joPageFirst, joPagePrev, joPageNext, joPageLast];
                $pagerinfo.attr('menus', $.toJsonString(joPageMenu));

                $pagerinfo.attr('menu-trigger', 'mouseenter').iMenus(joPageMenu, function (menuID, $titleSpan) {
                    if (menuID && menuID.length === 11) {
                        var p = 1;
                        if (menuID === 'menupager_1')
                            p = parseInt($wrap.attr('PageNo')) - 1;
                        else if (menuID === 'menupager_2')
                            p = parseInt($wrap.attr('PageNo')) + 1;
                        else if (menuID === 'menupager_3')
                            p = parseInt($wrap.attr('PageCount'));
                        $wrap.iGridView("buffer", p);
                    }
                });
                if (lang.isEn()) {
                    $pagerinfo.find('.pageinfo').text('(' + $wrap.attr('RowCount') + ' results)');
                }
                else {
                    $pagerinfo.find('.pageinfo').text('(共' + $wrap.attr('RowCount') + '条)');
                }
            }
            else {
                $pagerinfo.find('.iGridViewButton,.gopage').show();
                $pagerinfo.iMenus(false);
                if (lang.isEn()) {
                    var t = $wrap.attr('RowCount') + ' results';
                    if ($wrap.attr('retPageSize') !== '0' && parseInt($wrap.attr('RowCount')) > parseInt($wrap.attr('retPageSize'))) {
                        t += '(' + $wrap.attr('retPageSize') + '/page)';
                    }
                }
                else {
                    var t = '共' + $wrap.attr('RowCount') + '条';
                    if ($wrap.attr('retPageSize') !== '0' && parseInt($wrap.attr('RowCount')) > parseInt($wrap.attr('retPageSize'))) {
                        t += '(' + $wrap.attr('retPageSize') + '/页)';
                    }
                }
                $pagerinfo.find('.pageinfo').text(t)
            }
        }
    };

    //-- iReference -----------------------------------------------------------------------------

    $.fn.iReferenceSetValue = function (value, valueType, AutoOpenForm) {
        var $wrap = $(this);
        var $ctr = $wrap.find('input[type=text]').length != 0 ? $wrap.find('input[type=text]') : $wrap.find('input[type=hidden]');

        if (valueType === '#code#' && $wrap.attr('code') === value) return;

        $wrap.attr('lastInput', value);

        //if ($wrap.attr('uservalue') === 'true') {
        //    var refJson = { key: value, code: value, desc: value };
        //    $wrap.attr('key', value).attr('code', value).attr('desc', value).attr('json', JSON.stringify(refJson)).attr('title', value);
        //    if ($ctr.length > 0)
        //        $ctr.val(value);
        //    else
        //        $wrap.html(value);
        //    _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
        //    return $wrap;
        //}

        if (valueType == "#code#") {
            $wrap.attr('lastValue', '');
        }
        else if (value == $wrap.attr('key')) {
            $wrap.attr('lastValue', value);
        }

        if (!value) {
            $wrap.attr('key', '').attr('code', '').attr('desc', '').attr('json', '').removeAttr('title');
            if ($ctr.length > 0)
                $ctr.val('');
            else
                $wrap.html('');
            var jo = {
                key: '',
                code: '',
                desc: ''
            };

            $.each(ictr._rundata_.iReferenceRenderValue, function () { this($wrap, jo); });
            _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
            return $wrap;
        }

        //=================
        if ($wrap.attr('isloadingdata') === 'true') {
            setTimeout(function () { $wrap.iReferenceSetValue(value, valueType, AutoOpenForm); }, 500);
            return;
        }
        $wrap.attr('isloadingdata', 'true');

        var EntityName = $wrap.attr('entityname') || '';
        if (/\{\{(.*?)\}\}/.test(EntityName)) return $wrap.removeAttr('isloadingdata');
        if (/\{\{(.*?)\}\}/.test($wrap.attr('dfilterjson') || "{}")) {
            return $wrap.removeAttr('isloadingdata');
        }

        var filterjson = $.JsonObject($wrap.attr('dfilterjson') || "{}");
        if (!EntityName) {
            filterjson.Action = $wrap[0].ownerDocument.defaultView.svr._currentAssembly || svr._currentAssembly;
            filterjson.CtrID = $wrap.attr('id');
        }
        var args = {
            ctrID: $wrap.attr('id') || '',
            EntityName: EntityName,
            Value: value,
            valueType: valueType,
            KeyField: $wrap.attr('keyfield') || '',
            Reference: getUrlArg("e"),
            DFilterValue: $wrap.attr('dfiltervalue') || '',
            DFilterJson: $.toJsonString(filterjson),
            DTableValue: $wrap.attr('dtablevalue') || '',
            CheckAuthority: $wrap.attr('checkauthority') || 'false',
            AuthorityModule: $wrap.attr('authoritymodule') || '',
            FieldsList: $wrap.attr('fieldslist') || '',
            extds: $wrap.attr('extds') || '',
            excludeKeys: $wrap.attr('excludeKeys') || '',
            filterkeys: $wrap.attr('filterkeys') || '',
            Mulity: $wrap.attr('multiselect') || 'false',
            sql: $wrap.attr('sql') || '',
            oql: $wrap.attr('oql') || ''
        };

        var showtype = $wrap.attr('showtype') || '';

        if (/\{\{(.*?)\}\}/.test(args.KeyField)
            || /\{\{(.*?)\}\}/.test(args.DFilterValue)
            || /\{\{(.*?)\}\}/.test(args.DTableValue)
            || /\{\{(.*?)\}\}/.test(args.CheckAuthority)
            || /\{\{(.*?)\}\}/.test(args.FieldsList)
            || /\{\{(.*?)\}\}/.test(args.extds)
            || /\{\{(.*?)\}\}/.test(args.filterkeys)
            || /\{\{(.*?)\}\}/.test(args.excludeKeys))
            return $wrap.removeAttr('isloadingdata');

        if ($wrap.attr('isSync') === 'true')
            _setReferenceJsonToCtrl($.iReferenceLoadData(args));
        else
            $.iReferenceLoadData(args, _setReferenceJsonToCtrl);
        return $wrap;

        function _setReferenceJsonToCtrl(jsonstr) {
            var jo = $.JsonObject(jsonstr);
            var key = jo.key || '';
            var code = jo.code || '';
            var desc = jo.desc || '';
            if (!jsonstr) {
                if ($wrap.attr('uservalue') === 'true') {
                    var refJson = { key: value, code: value, desc: value };
                    $wrap.attr('key', value).attr('code', value).attr('desc', value).attr('json', JSON.stringify(refJson)).attr('title', value);
                    if ($ctr.length > 0)
                        $ctr.val(value);
                    else
                        $wrap.html(value);

                    $.each(ictr._rundata_.iReferenceRenderValue, function () { this($wrap, jo); });
                    _miss_fun.triggerAfterChange($wrap, AutoOpenForm); //触发AfterChange事件
                }
                else {
                    var searchStr = '';
                    $wrap.attr('key', '').attr('code', '').attr('desc', '').attr('json', '').removeAttr('title');
                    if ($ctr.length > 0) {
                        searchStr = $ctr.val();
                        $ctr.val('');
                    }
                    if (AutoOpenForm === true) {
                        $wrap.iReferenceOpenForm(searchStr);
                    }
                    else {
                        $.each(ictr._rundata_.iReferenceRenderValue, function () { this($wrap, jo); });
                        _miss_fun.triggerAfterChange($wrap, AutoOpenForm); //触发AfterChange事件
                    }
                }
            }
            else {
                $wrap.attr('key', key).attr('code', code).attr('desc', desc).attr('json', $.toJsonString(jsonstr)).attr('title', code + '\r\n' + desc);
                if ($ctr.length > 0)
                    $ctr.val(showtype == 'code' ? code : (showtype == 'desc' ? desc : key));
                else
                    $wrap.html(showtype == 'code' ? code : (showtype == 'desc' ? desc : key));

                $.each(ictr._rundata_.iReferenceRenderValue, function () { this($wrap, jo); });
                _miss_fun.triggerAfterChange($wrap, AutoOpenForm); //触发AfterChange事件
            }
            $wrap.removeAttr('isloadingdata');
        }
    };

    $.iReferenceLoadData = function (args, _callback) {
        //Value, valueType, EntityName, KeyField, DFilterValue, DFilterJson, DTableValue, CheckAuthority, FieldsList, extds, excludeKeys, filterkeys, sql, oql
        var val = args.Value || '';
        if (!val) {
            if (_callback) _callback(null);
            return null;
        }

        var vtype = args.valueType || '';

        //filterkeys
        var filterkeys = args.filterkeys || '';
        if (filterkeys && /\{\{(.*?)\}\}/.test(filterkeys.toString()) === false) {
            filterkeys = ',' + $.trim(filterkeys.replace(/\s/g, '')) + ',';
            if (filterkeys.indexOf(',' + val + ',') < 0) {
                if (_callback) _callback(null);
                return null;
            }
        }

        //excludeKeys
        var excludeKeys = args.excludeKeys || '';
        if (excludeKeys && /\{\{(.*?)\}\}/.test(excludeKeys.toString()) === false) {
            excludeKeys = ',' + $.trim(excludeKeys.replace(/\s/g, '')) + ',';
            if (excludeKeys.indexOf(',' + val + ',') >= 0) {
                if (_callback) _callback(null);
                return null;
            }
        }
        //extds
        var extds = args.extds || '';
        if (extds && /\{\{(.*?)\}\}/.test(extds) === false) {
            extds = _miss_fun.InitiSelectDS(extds, '', '', false, '');
            for (var i = 0; i < extds.length; i++) {
                if (val === extds[i][0] || val === extds[i][1] || val === extds[i][2]) {
                    var rettemp = JSON.stringify({
                        key: extds[i][0],
                        code: extds[i][1],
                        desc: extds[i][2]
                    });
                    if (_callback) _callback(rettemp);
                    return rettemp;
                }
            }
        }

        //cache
        var ctrID = args.ctrID;
        if (ctrID) {
            var cache = _miss_fun._iReferenceCache[ctrID];
            if (cache) {
                var keyidx = null, codeidx = null, descidx = null, refidx = null;
                var cols = cache["cols"];
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i][0] === "key")
                        keyidx = cols[i][1];
                    else if (cols[i][0] === "code")
                        codeidx = cols[i][1];
                    else if (cols[i][0] === "desc")
                        descidx = cols[i][1];
                    else if (cols[i][0] === "ref")
                        refidx = cols[i][1];
                }
                var rows = cache["rows"];
                var rowslen = rows.length;
                var row;
                for (var i = 0; i < rowslen; i++) {
                    row = rows[i];
                    if (row[keyidx] == val
                        || vtype == '#code#' && (row[codeidx] == val || row[descidx] == val || (refidx !== null && row[refidx] == val))) {
                        var retdata = {};
                        for (var i = 0; i < cols.length; i++) {
                            retdata[cols[i][0]] = row[cols[i][1]];
                        }

                        if (_callback) _callback(retdata);
                        return retdata;
                    }
                }
            }
            else
                $('#' + ctrID).iReferenceLoadCache();
        }

        //get data from svr
        var data = {
            EntityName: args.EntityName || '',
            Value: val,
            ValueType: vtype,
            KeyField: args.KeyField || '',
            Reference: getUrlArg("e"),
            DFilterValue: args.DFilterValue || '',
            DFilterJson: args.DFilterJson || '',
            DTableValue: args.DTableValue || '',
            CheckAuthority: args.CheckAuthority === true || args.CheckAuthority === 'true' ? 'true' : 'false',
            AuthorityModule: args.AuthorityModule || '',
            FieldsList: args.FieldsList || '',
            Mulity: args.Mulity === true || args.Mulity === 'true' ? 'true' : 'false',
            oql: args.oql || ''
        };

        if (args.sql) {
            data.EntityName = "Miss.iControls.CustRef.iReferenceBySql";
            data.DFilterValue = args.sql;
        }

        var url = "/api/icontrols/iReferenceData/GetReference";
        var rettemp = null;
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            url: url,
            data: { args: $.toJsonString(data) },
            cache: false,
            async: _callback != null
        }).done(function (ret) {
            if (_callback == null) {
                rettemp = ret;
            }
            else {
                _callback(ret);
            }
        });
        return rettemp;
    };

    $.fn.iReferenceLoadCache = function () {
        //EntityName, KeyField, DFilterValue, DFilterJson, DTableValue, CheckAuthority, FieldsList
        var $wrap = $(this);

        if ($.browser.isPhone) return;
        if ($wrap.attr('KeepBuffer') !== 'true') return;
        if (_miss_fun._iReferenceCache[$wrap.attr('id')]) return;

        var EntityName = $wrap.attr('entityname') || '';

        var filterjson = $.JsonObject($wrap.attr('dfilterjson') || "{}");
        if (!EntityName) {
            filterjson.Action = svr._currentAssembly;
            filterjson.CtrID = $wrap.attr('id');
        }

        var data = {
            EntityName: EntityName,
            KeyField: $wrap.attr('keyfield') || '',
            Reference: getUrlArg("e"),
            DFilterValue: $wrap.attr('dfiltervalue') || '',
            DFilterJson: $.toJsonString(filterjson) || '',
            DTableValue: $wrap.attr('dtablevalue') || '',
            CheckAuthority: $wrap.attr('checkauthority') || 'false',
            AuthorityModule: $wrap.attr('authoritymodule') || '',
            FieldsList: $wrap.attr('fieldslist') || '',
            oql: $wrap.attr('oql') || ''
        };
        if ($wrap.attr('sql')) {
            data.EntityName = "Miss.iControls.CustRef.iReferenceBySql";
            data.DFilterValue = $wrap.attr('sql');
        }

        var url = "/api/icontrols/iReferenceData/GetReferenceCache";
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            url: url,
            data: { args: $.toJsonString(data) },
            cache: false,
        }).done(function (ret) {
            if (!ret) return;
            if (ret.constructor === Object) {
                var errMsg = ret["message"] || "出错了:" + $.toJsonString(ret);
                openAlert(errMsg);
                return;
            }
            ret = ret.replace(/\t/g, '","').replace(/\r/g, '"],["');
            _miss_fun._iReferenceCache[$wrap.attr('id')] = $.JsonObject(ret);
        });
        return $wrap;
    };

    $.fn.iReferenceOpenForm = function (searchStr, _callbackfn) {
        var $wrap = $(this);
        if ($wrap.attr('openingForm') == 'true') return $wrap;
        $wrap.attr('openingForm', 'true');
        var $ctr = $wrap.find('input[type=text]');
        if ($ctr.attr('disabled') === 'disabled') return $wrap;

        window._isOpening_iRefForm = true; //标志当前正在打开参照选择窗口

        if (searchStr && searchStr.constructor === Function) {
            _callbackfn = searchStr;
            searchStr = '';
        }

        if (!searchStr && $wrap.attr('uservalue') === 'true') {
            searchStr = $ctr.val();
        }

        var EntityName = encodeURIComponent($wrap.attr('entityname') || '');
        var KeyField = encodeURIComponent($wrap.attr('keyfield') || '');
        var DFilterValue = encodeURIComponent($wrap.attr('dfiltervalue') || '');
        var DFilterJson = encodeURIComponent($wrap.attr('dfilterjson') || '');
        var DTableValue = encodeURIComponent($wrap.attr('dtablevalue') || '');
        var excludekeys = encodeURIComponent($wrap.attr('excludekeys') || '');
        var filterkeys = encodeURIComponent($wrap.attr('filterkeys') || '');
        var extds = _miss_fun.InitiSelectDS($wrap.attr('extds') || '', '', '', false, '');
        extds = encodeURIComponent($.toJsonString(extds));
        var CheckAuthority = $wrap.attr('checkauthority') || 'false';
        var AuthorityModule = encodeURIComponent($wrap.attr('AuthorityModule') || '');
        var KeepBuffer = $wrap.attr('KeepBuffer') || 'false';
        var SearchStr = encodeURIComponent(searchStr || '');
        var mulity = $wrap.attr('multiselect') || 'false';
        var oql = $wrap.attr('oql') || '';

        if ($wrap.attr("sql")) {
            EntityName = "Miss.iControls.CustRef.iReferenceBySql";
            DFilterValue = encodeURIComponent($wrap.attr("sql"));
        }

        var formUrl = $wrap.attr('url');
        //自定义参照窗口
        if (!formUrl) formUrl = "/Common/iControls/iReference_Default";

        formUrl += formUrl.indexOf('?') > 0 ? '&' : '?';
        formUrl += "e=" + EntityName + "&k=" + KeyField + "&ext=" + extds +
            "&dv=" + DFilterValue + "&dj=" + DFilterJson + "&dt=" + DTableValue + "&ek=" + excludekeys + "&fk=" + filterkeys +
            "&ca=" + CheckAuthority + "&am=" + AuthorityModule + "&buf=" + KeepBuffer + "&seh=" + SearchStr + "&mt=" + mulity +
            "&oql=" + oql;
        if (!EntityName) {
            formUrl += "&act=" + encodeURIComponent(svr._currentAssembly);
            formUrl += "&cid=" + encodeURIComponent($wrap.attr('id') || '');
        }

        if ($wrap.attr('url')) {
            var dlgwidth = $wrap.attr('dlgwidth') || 1000;
            var dlgheight = $wrap.attr('dlgheight') || 600;
            openDialog(formUrl, { width: dlgwidth, height: dlgheight, max: true, resize: true, choose: true }, function (retValue) {
                if (!retValue) {
                    $wrap.removeAttr('openingForm');
                    return;
                }
                $wrap.iReferenceSetValue(retValue, '#key#', false)
                if (_callbackfn != null) _callbackfn.call(window, retValue);
                if (retValue) _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                $wrap.removeAttr('openingForm');
            });
            return $wrap;
        }

        var dlgwidth = $wrap.attr('dlgwidth') || 600;
        var dlgheight = $wrap.attr('dlgheight') || 540;
        openDialog(formUrl, { width: dlgwidth, height: dlgheight, max: true, resize: true, choose: true }, function (retValue) {
            if (!retValue) {
                window._isOpening_iRefForm = false; //标志当前正在打开参照选择窗口
                $wrap.removeAttr('openingForm');
                return;
            }
            $wrap.iReferenceSetValue(retValue, '#key#', false)
            if (_callbackfn != null) _callbackfn.call(window, retValue);
            if (retValue) _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件

            window._isOpening_iRefForm = false; //标志当前正在打开参照选择窗口
            $wrap.removeAttr('openingForm');
        });
        return $wrap;
    };

    $.openReferenceForm = function (Args, _callbackfn, extData) {
        /// <summary>
        ///     打开参照页面
        ///     &#10;1 - openReferenceForm(Args, _callbackfn, extData)
        ///     &#10;2 - openReferenceForm(Args, _callbackfn)
        /// </summary>
        /// <param name="Args" type="Json">
        ///     查询参数：{'entityname','keyfield','dfiltervalue','dfilterjson','dtablevalue','checkauthority','searchstr', 'mulity', 'keepbuffer', 'sql', 'oql'};
        /// </param>
        /// <param name="_callbackfn" type="Function">
        ///     可选参数，回调函数
        /// </param>

        var EntityName = encodeURIComponent(Args['entityname'] || '');
        var KeyField = encodeURIComponent(Args['keyfield'] || '');
        var DFilterValue = encodeURIComponent(Args['dfiltervalue'] || '');
        var DFilterJson = encodeURIComponent(Args['dfilterjson'] || '');
        var DTableValue = encodeURIComponent(Args['dtablevalue'] || '');
        var excludekeys = encodeURIComponent(Args['excludekeys'] || '');
        var filterkeys = encodeURIComponent(Args['filterkeys'] || '');
        var extds = _miss_fun.InitiSelectDS(Args['extds'] || '');
        extds = encodeURIComponent($.toJsonString(extds));
        var CheckAuthority = Args['checkauthority'] === undefined ? 'false' : Args['checkauthority'];
        var AuthorityModule = encodeURIComponent(Args['AuthorityModule'] || '');
        var KeepBuffer = Args['keepbuffer'] === undefined ? 'false' : Args['keepbuffer'];
        var SearchStr = encodeURIComponent(Args['searchstr'] || '');
        var oql = encodeURIComponent(Args['oql'] || '');

        var mulity = Args['mulity'] === undefined ? 'false' : Args['mulity'];

        if (Args["sql"]) {
            EntityName = "Miss.iControls.CustRef.iReferenceBySql";
            DFilterValue = encodeURIComponent(Args["sql"]);
        }

        var formUrl = "/Common/iControls/iReference_Default?e=" + EntityName + "&k=" + KeyField + "&ext=" + extds +
            "&dv=" + DFilterValue + "&dj=" + DFilterJson + "&dt=" + DTableValue + "&ek=" + excludekeys + "&fk=" + filterkeys +
            "&ca=" + CheckAuthority + "&am=" + AuthorityModule + "&buf=" + KeepBuffer + "&seh=" + SearchStr + "&mt=" + mulity +
            "&oql=" + oql;
        if (!EntityName) {
            formUrl += "&act=" + encodeURIComponent(svr._currentAssembly);
            formUrl += "&cid=" + encodeURIComponent(Args['ctrid'] || '');
        }

        openDialog(formUrl, { width: 550, height: 540, max: true, resize: true, choose: true }, function (retValue) {
            if (_callbackfn) _callbackfn.call(window, retValue, extData);
        });
    };

    $.fn.iReferenceJson = function (key) {
        var sJ = $(this).attr('json') || '';
        if (!sJ) {
            return null;
        }
        var jo = $.JsonObject(sJ);

        if (!key) {
            return jo;
        }
        else {
            return jo[key] == null ? '' : jo[key];
        }
    };

    $.fn.iLabelSetValue = function (value) {
        var $wrap = $(this);
        var ref = $wrap.attr('ref') || '';
        if (ref) {
            var $ref = $('#' + ref);
            if (!$wrap.attr('entityname')) $wrap.attr('entityname', $ref.attr('entityname') || '');
            if (!$wrap.attr('keyfield')) $wrap.attr('keyfield', $ref.attr('keyfield') || '');
            if (!$wrap.attr('dfiltervalue')) $wrap.attr('dfiltervalue', $ref.attr('dfiltervalue') || '');
            if (!$wrap.attr('dfilterjson')) $wrap.attr('dfilterjson', $ref.attr('dfilterjson') || '');
            if (!$wrap.attr('dtablevalue')) $wrap.attr('dtablevalue', $ref.attr('dtablevalue') || '');
            if (!$wrap.attr('extds')) $wrap.attr('extds', $ref.attr('extds') || '');
        }
        var EntityName = $wrap.attr('entityname') || '';
        if (!EntityName && !ref) {
            return $wrap.attr('title', value).find('>span').text(value);
        }

        if (!value) return $wrap.attr('key', '').removeAttr('title').find('>span').html('');

        var filterjson = $.JsonObject($wrap.attr('dfilterjson') || "{}");
        if (!EntityName) {
            filterjson.Action = svr._currentAssembly;
            filterjson.CtrID = ref || $wrap.attr('id');
        }

        if (/\{\{(.*?)\}\}/.test(value)
            || /\{\{(.*?)\}\}/.test(EntityName || "")
            || /\{\{(.*?)\}\}/.test($wrap.attr('extds') || "")
            || /\{\{(.*?)\}\}/.test($wrap.attr('dfilterjson') || "{}"))
            return $wrap;

        //dlgurl
        if (value && (EntityName === 'Miss.Org.Contact' || EntityName === 'Miss.Org.Person' || EntityName === 'Miss.BE.SD.Customer')) {
            var DialogUrl = "/Common/iControls/iLabel_DetailInfo?be=" + EntityName
                + "&kf=" + encodeURIComponent($wrap.attr('keyfield') || '')
                + "&dv=" + encodeURIComponent($wrap.attr('dfiltervalue') || '')
                + "&dj=" + encodeURIComponent($.toJsonString(filterjson))
                + "&dt=" + encodeURIComponent($wrap.attr('dtablevalue') || '')
                + "&extds=" + encodeURIComponent($wrap.attr('extds') || '')
                + "&val=" + encodeURIComponent(value);
            $wrap.attr('dlgurl', DialogUrl);
        }

        var valexp = $wrap.attr('valexp') || '';
        if (valexp && vm && vm['$' + valexp] && vm['$' + valexp].code) {
            if ($wrap.attr('isbindedref')) return $wrap;
            SetiLabelText($wrap, vm['$' + valexp]);
            $('#' + valexp).on("AfterChange", function () {
                SetiLabelText($wrap, vm['$' + valexp]);
            });
            return $wrap.attr('isbindedref', 'true');
        }

        var args = {
            EntityName: EntityName,
            Value: value,
            valueType: "#key#",
            KeyField: $wrap.attr('keyfield') || '',
            DFilterValue: $wrap.attr('dfiltervalue') || '',
            DFilterJson: $.toJsonString(filterjson),
            DTableValue: $wrap.attr('dtablevalue') || '',
            extds: $wrap.attr('extds') || '',
            Mulity: true
        };

        if ($wrap.attr('sql')) {
            data.EntityName = "Miss.iControls.CustRef.iReferenceBySql";
            data.DFilterValue = $wrap.attr('sql');
        }

        $.iReferenceLoadData(args, function (jsonstr) {
            if (!jsonstr) {
                $wrap.attr('key', '').removeAttr('title').find('>span').html('');
            }
            else {
                SetiLabelText($wrap, $.JsonObject(jsonstr));
            }
        });

        function SetiLabelText($wrap, jo) {
            var TextStyle = $wrap.attr('textstyle');
            var text = jo.desc;
            if (TextStyle == 'key')
                text = jo.key;
            else if (TextStyle == 'code')
                text = jo.code;
            else if (TextStyle == 'code_desc')
                text = jo.code + "-" + jo.desc;
            else if (TextStyle == 'desc_code')
                text = jo.desc + "(" + jo.code + ")";
            else if (TextStyle == 'key_desc')
                text = jo.key + "-" + jo.desc;
            else if (TextStyle == 'desc_key')
                text = jo.desc + "(" + jo.key + ")";
            $wrap.attr('key', jo.key).attr('title', jo.code + '\r\n' + jo.desc).find('>span').html(text);
        }
    };

    $.fn.iTextSetValue = function (value) {
        var $this = $(this);
        var id = $this.attr('id');
        var NameType = $this.attr('tonametype');
        if (!NameType || NameType === 'none') {
            var Type = $this.attr('TextType').toLowerCase();
            if (Type === 'editor') {
                $this.find('>div.ieditor-body').html(value);
            }
            else if (Type === 'markdown') {
                var editorId = $this.attr('_Code_Editor_InstanceID');
                if (editorId && window[editorId])
                    window[editorId].setMarkdown(value);
            }
            else if (Type === 'code') {
                var editorId = $this.attr('_Code_Editor_InstanceID');
                if (editorId && window[editorId])
                    window[editorId].setValue(value);
            }
            else {
                if (Type === "integer") {
                    if (/^[\-|,|.|0-9]+$/.test(value.toString()) == false)
                        value = "";
                    else {
                        value = parseInt(value.toString().replace(/\,/g, ''));
                    }
                }
                if (Type === "decimal" && /^[\-|,|.|0-9]+$/.test(value.toString()) === false) value = "";
                if (Type === "percent" && value) {
                    value = $.trim(value);
                    if (value.substr(value.length - 1) === '%')
                        value = value.substr(0, value.length - 1);
                    else
                        value = parseFloat(value.toString()) * 100;
                    value = $.optimizeNumber(value);
                }
                else if ((Type === "integer" || Type === "decimal") && value) {
                    value = $.FormatNumber(value, $this.attr('FormatStr') || '-1');
                    if ($.browser.isPhone) {
                        value = (value || '').replace(/\,/g, '');
                    }
                }

                if ($this.find('input[type="password"]').length > 0)
                    $this.find('input[type="password"]').val(value);
                else if ($this.find('input[type="hidden"]').length > 0)
                    $this.find('input[type="hidden"]').val(value);
                else if ($this.find('input[type]').length > 0) {

                    if (value && $this.find('input[type]').attr('type') == 'date') {
                        value = $.formatDate(new Date(value.toString()), "yyyy-MM-dd");
                    }
                    $this.find('input[type]').val(value).attr('title', value);
                }
                else if ($this.find('textarea').length > 0) {
                    var ta = $this.find('textarea').val(value)[0];
                    if ($this.attr('isdisabled') == 'true' && $this.attr('AutoHeight') === 'true'
                        && ta.style.height //当前控件处于隐藏
                    ) {
                        ta.style.height = '2px';
                        var h = ta.scrollHeight;
                        if (h < 21) h = 21;
                        ta.style.height = h + 'px';
                        $this.css('height', 'auto');
                    }
                }
                else
                    $this.html(value).attr('title', value);
            }
            _miss_fun.triggerAfterChange($this); //触发AfterChange事件
        }
        else {
            if (!value) {
                $this.find('input[type]').attr('code', '').val('');
                return $this;
            }
            if (/\{\{(.*?)\}\}/.test(value)) return $this;

            var data = {
                ToNameType: NameType,
                Value: value
            };
            var url = "/api/icontrols/iReferenceData/GetiTextToName";
            $.ajax({
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                url: url,
                data: data,
                cache: false,
                async: true
            }).done(function (ret) {
                $this.find('input[type]').attr('code', value).val(ret).attr('title', value + '\r\n' + ret);
                _miss_fun.triggerAfterChange($this); //触发AfterChange事件
            });
        }
    };

    /** 从字符串列表删除特定值 */
    $.fn.iReferenceDeleteItem = function (itemKey) {

        var $ref = $(this);
        if ($ref.attr('multiselect') !== 'true') return;

        //key
        var vals = ($ref.attr('key') || '').split(',');

        var idx = -1;
        $.each(vals, function (i, v) {
            if (v == itemKey) {
                idx = i;
                return false;
            }
        });
        vals.splice(idx, 1);
        var value = vals.join(',');


        $ref.iReferenceSetValue(value, '#key#', false);
    }

    //-- iSelect  -------------------------------------------------------------------------------

    $.fn.iSelect = function () {
        var $wrap = $(this);
        if ($wrap.length === 0) return;

        //if ($wrap.attr('Initialized') === 'true') return;
        //$wrap.attr('Initialized', 'true');

        $wrap.attr('key', $wrap.attr('key') || '').attr('code', $wrap.attr('code') || '').attr('desc', $wrap.attr('desc') || '');

        if (!$wrap.attr('ds')) {
            if (vm && vm.__runtime_data__.status < 2) {
                vm.mounted(function () {
                    $wrap.iSelectLoadDS(function () {
                        BuildiSelectList();
                        $wrap.iSelectSetKey($wrap.attr('key') || '');
                    });
                });
            }
            else {
                $wrap.iSelectLoadDS(function () {
                    BuildiSelectList();
                    $wrap.iSelectSetKey($wrap.attr('key') || '');
                });
            }
        }
        else {
            BuildiSelectList();
            $wrap.iSelectSetKey($wrap.attr('key') || '');
        }
        return $wrap;

        function BuildiSelectList() {
            if ($wrap.attr('showaslist') !== "true") return;
            var table = _miss_fun.BuildiSelectPickerTable($wrap);
            $wrap.find('>div').html(table);
        }
    };

    $.fn.iSelectSetDS = function (ds) {
        var $this = $(this);
        if (!ds) ds = '[["","",""]]';
        $this.attr('ds', ds);
        if ($this.attr('showaslist') === 'true') {
            var table = _miss_fun.BuildiSelectPickerTable($this);
            $this.find('>div').html(table);
        }
        $this.iSelectSetKey($this.attr('lastValue') || $this.attr('key') || '');
        return $this;
    };

    $.fn.iSelectGetDSWithSearchWord = function (SearchWord) {
        var $wrap = $(this);
        return _miss_fun.InitiSelectDS($wrap.attr('ds'), $wrap.attr('extds'), $wrap.attr('excludekeys'), $wrap.attr('filterkeys'), $wrap.attr('addempty'), SearchWord);

    };

    $.fn.iSelectLoadDS = function (_callback) {
        var $this = $(this);
        if ($this.attr('isloadingds') === 'true') {
            setTimeout(function () { $this.iSelectLoadDS(_callback); }, 500);
            return;
        }
        $this.attr('isloadingds', 'true');

        var EntityName = $this.attr('entityname') || '';
        var KeyField = $this.attr('keyfield') || '';
        var DFilterValue = $this.attr('dfiltervalue') || '';
        var DFilterJson = $this.attr('dfilterjson') || "{}";
        var DTableValue = $this.attr('dtablevalue') || '';
        var CheckAuthority = $this.attr('checkauthority') || 'false';

        if (/\{\{(.*?)\}\}/.test(EntityName) || /\{\{(.*?)\}\}/.test(KeyField) || /\{\{(.*?)\}\}/.test(DFilterValue)
            || /\{\{(.*?)\}\}/.test(DFilterJson) || /\{\{(.*?)\}\}/.test(DTableValue) || /\{\{(.*?)\}\}/.test(CheckAuthority)) {
            $this.removeAttr('isloadingds');
            return $this;
        }

        var filterjson = $.JsonObject(DFilterJson);
        if (!EntityName) {
            filterjson.Action = svr._currentAssembly;
            filterjson.CtrID = $this.attr('id');
        }
        var data = {
            EntityName: EntityName,
            KeyField: KeyField,
            DFilterValue: DFilterValue,
            DFilterJson: $.toJsonString(filterjson),
            DTableValue: DTableValue,
            CheckAuthority: CheckAuthority,
            oql: $this.attr('oql') || ''
        };

        if ($this.attr('sql')) {
            data.EntityName = "Miss.iControls.CustRef.iReferenceBySql";
            data.DFilterValue = $this.attr('sql');
        }

        //iGridView edit cache
        if ($this.attr('id').startsWith('iEditCtrl_')) {
            var cachedDs = window['iEditCtrl_iselectDS_' + $.toJsonString(data)];
            if (cachedDs) {
                if (typeof _callback == "function") {
                    $this.iSelectSetDS(cachedDs);
                    _callback(cachedDs);
                }
                return $this;
            }
        }

        var url = "/api/icontrols/iSelectData";
        $.ajax({
            type: "GET",
            contentType: 'application/x-www-form-urlencoded',
            url: url,
            data: data,
            cache: false,
            async: $this.attr('isSync') !== 'true'
        }).done(function (ret) {
            if (ret == "#undefined#") return;

            if (isError(ret)) {
                openAlert('读取iSelect数据源时出错<br>控件ID:' + $this.attr('id') + "<br>" + ret);
            }
            else {
                window['iEditCtrl_iselectDS_' + $.toJsonString(data)] = ret;
                $this.iSelectSetDS(ret);
                if (typeof _callback == "function") {
                    _callback(ret);
                }
            }
            $this.removeAttr('isloadingds');
        }).fail(function (xhr) {
            var errmsg = 'iSelectData调用失败, 无法连接服务器, status:' + xhr.statusText + '(' + xhr.status + '),readyState:' + xhr.readyState;
            console.log(errmsg)
            $this.removeAttr('isloadingds');
        });
        return $this;
    };

    $.fn.iSelectSetKey = function (value) {
        if (value === 0) value = '0';
        if (value === false) value = 'false';
        value = (value || '').toString();

        var $this = $(this);
        $this.attr('lastValue', value);

        var ds = _miss_fun.InitiSelectDS($this.attr('ds'), $this.attr('extds'), $this.attr('excludekeys'), $this.attr('filterkeys'), $this.attr('addempty'), '');
        var key1 = "", key = "", code = "", desc = "";
        if ($this.attr('multiselect') === 'true') {
            var chks = $this.find("input[type=checkbox]").prop('checked', false); //清空所有的选中

            var keys = [], codes = [], descs = [];
            var vals = value ? (value.split(',')) : [];
            for (var i = 0; i < vals.length; i++) {
                key1 = $.trim(vals[i]);
                key = code = desc = "";
                for (var j = 0; j < ds.length; j++) {
                    if (ds[j][0] == key1) {
                        key = ds[j][0];
                        code = ds[j][1];
                        desc = ds[j][2];
                        break;
                    }
                }
                if (key != "") {
                    keys.push(key);
                    codes.push(code);
                    descs.push(desc);

                    //将选中的值赋给控件
                    chks.each(function () {
                        if ($(this).parent().parent().attr('key') == key) $(this).prop('checked', true);
                    });

                }
            }
            key = keys.join(',');
            code = codes.join(',');
            desc = descs.join(',');
        }
        else {
            //优先匹配key
            for (var i = 0; i < ds.length; i++) {
                if (ds[i][0].toString() === value) {
                    key = ds[i][0]; code = ds[i][1]; desc = ds[i][2];
                    break;
                }
            }
            if (!key) {
                //匹配Code和Desc
                for (var i = 0; i < ds.length; i++) {
                    if (ds[i][1].toString() && ds[i][1].toString() === value || ds[i][2].toString() && ds[i][2].toString() === value) {
                        key = ds[i][0]; code = ds[i][1]; desc = ds[i][2];
                        break;
                    }
                }
            }
            if (key === "" && $this.attr('uservalue') === 'true') key = code = desc = value;
        }

        if (key === "" && ds.length > 0 && $this.attr('multiselect') !== 'true') //如果为空，选第一个
        {
            if ($this.attr('AutoSelect') && ds.length == 2 && !ds[0][0]) {
                key = ds[1][0];
                code = ds[1][1];
                desc = ds[1][2];
            }
            else {
                key = ds[0][0];
                code = ds[0][1];
                desc = ds[0][2];
            }
        }
        $this.attr('key', key).attr('code', code).attr('desc', desc);

        if ($this.attr('showaslist') === "true") {
            $this.find('tr').removeClass("chosen");
            $this.find('tr').each(function () {
                var $tr = $(this);
                if ($tr.attr('key') === key) $tr.addClass("chosen");
            });
        }
        else {
            var $ctrInput = $this.find('input[type=text]');
            if ($ctrInput.length > 0) {
                var showtype = $this.attr('showtype');
                $ctrInput.val(showtype == 'desc' ? desc : (showtype == 'key' ? key : code)).attr('title', code + '\r\n' + desc);
            }
            else {
                $ctrInput = $this.find('select');
                if ($ctrInput.length > 0)
                    $ctrInput.val(key).attr('title', code + '\r\n' + desc);
                else {
                    //ToLabel
                    var ShowText = EncodeHtml(desc || '');
                    $this.addClass('showaslabel').html(ShowText || '&nbsp;');
                    $this.attr('title', $this.attr('code') + "\r\n" + ShowText);
                }
            }
        }

        _miss_fun.triggerAfterChange($this); //触发AfterChange事件

        return $this;
    };

    $.fn.iSelectGetDS = function () {
        var $wrap = $(this);
        return _miss_fun.InitiSelectDS($wrap.attr('ds'), $wrap.attr('extds'), $wrap.attr('excludekeys'), $wrap.attr('filterkeys'), $wrap.attr('addempty'), '');
    };

    $.fn.iSelectCheckAll = function () {
        var $wrap = $(this);
        var ds = _miss_fun.InitiSelectDS($wrap.attr('ds'), $wrap.attr('extds'), $wrap.attr('excludekeys'), $wrap.attr('filterkeys'), $wrap.attr('addempty'), '');
        var keys = '';
        for (var j = 0; j < ds.length; j++) {
            if (ds[j][0]) keys += ds[j][0] + ',';
        }
        if (keys) keys = keys.substr(0, keys.length - 1);
        $wrap.iSelectSetKey(keys);
    };

    $.fn.iBpmLoadData = function (_callback) {
        var $this = $(this);
        if ($this.attr('isloadingds') === 'true') {
            setTimeout(function () { $this.iBpmLoadData(_callback); }, 500);
            return;
        }
        $this.attr('isloadingds', 'true');


        var DocNo = $this.attr('DocNo') || '';
        var CustBpmData = $this.attr('CustBpmData') || '';
        var CanSubmit = $this.attr('CanSubmit') || 'true';
        if (vm.$isWorkFlow) CanSubmit = 'false';

        if (!DocNo) {
            $this.find('.ibpm-list').html('');
            $this.find('.ictr-input').html(lang('单据未提交审批流', 'Document hasn\'t submitted'));
            $this.attr('Status', '');
            if ($this.attr('stamp') !== undefined) $this.attr('stamp', '');
            if (_callback && _callback.constructor === Function) _callback(ret);
            $this.removeAttr('isloadingds');
            return;
        }

        if (/\{\{(.*?)\}\}/.test(DocNo)) {
            $this.removeAttr('isloadingds');
            return $this;
        }
        if (/\{\{(.*?)\}\}/.test(CustBpmData)) {
            $this.removeAttr('isloadingds');
            return $this;
        }
        var url = "/api/icontrols/iBpmData/GetiBpmHtml?DocNo=" + encodeURIComponent(DocNo) + "&CustBpmData=" + encodeURIComponent(CustBpmData) + "&CanSubmit=" + CanSubmit + "&isSimple=" + ($this.attr('isSimple') || 'false');
        $.ajax({
            type: "GET",
            contentType: 'application/x-www-form-urlencoded',
            url: url,
            cache: false
        }).done(function (ret) {
            if (!ret) return;
            ret = $.JsonObject(ret);
            $this.find('.ibpm-list').html(ret.Html);
            if (ret.Status == null) {
                $this.find('.ictr-input').html(lang('单据未提交审批流', 'Document hasn\'t submitted'));
            }
            else {
                $this.find('.ictr-input').html('当前流程状态:' + '<span class="ibpm-status">' + ret.StatusName + '</span>');
            }
            $this.attr('Status', ret.Status);
            if ($this.attr('stamp') !== undefined) $this.attr('stamp', ret.Status == null ? '' : ret.Status);

            if (_callback && _callback.constructor === Function) _callback(ret);
            $this.removeAttr('isloadingds');
        }).fail(function (xhr) {
            var errmsg = 'GetiBpmHtml调用失败, 无法连接服务器, status:' + xhr.statusText + '(' + xhr.status + '),readyState:' + xhr.readyState;
            console.log(errmsg)
            $this.removeAttr('isloadingds');
        });
        return $this;
    };

    //-- iAttachment ----------------------------------------------------------------------------

    $.fn.iAttFilesCount = function () {
        var $wrap = $(this);
        var id = $wrap.attr('id');
        if ($wrap.attr('IsCustomUpload') == 'true') {
            if (!_miss_fun._iAttURLData[id]) return 0;
            return _miss_fun._iAttURLData[id].length;
        }

        var DocKey = $wrap.attr('DocKey') || '';
        if (!DocKey || /\{\{(.*?)\}\}/.test(DocKey)) {
            return $wrap.find('a,.imgItem').length;
        }

        var ModuleKey = $wrap.attr('ModuleKey') || '';
        var SubKey = $wrap.attr('SubKey') || '';

        if (ModuleKey && /\{\{(.*?)\}\}/.test(ModuleKey)) return 0;
        if (SubKey && /\{\{(.*?)\}\}/.test(SubKey)) return 0;

        var SavePath = $wrap.attr('savepath') || '';
        var IsPathMode = $wrap.attr('ispathmode') === 'true';

        var data, url;
        if (IsPathMode) {
            data = { SavePath: SavePath };
            url = "/api/icontrols/iAttachmentData/GetFilesCountByPath";
        }
        else {
            data = { ModuleKey: ModuleKey, DocKey: DocKey, SubKey: SubKey };
            url = "/api/icontrols/iAttachmentData/GetFilesCount";
        }
        var rettemp = '';
        $.ajax({
            async: false,
            type: "GET",
            url: url,
            cache: false,
            data: data,
            success: function (ret) {
                rettemp = ret;
            }
        });
        return parseInt(rettemp);
    };

    $.fn.iAttDelete = function (ID) {
        if (!ID) return;
        var $wrap = $(this);

        if ($wrap.attr('IsCustomUpload') == 'true') {
            var jo = _miss_fun._iAttURLData[$wrap.attr('id')];
            if (!jo) return;
            for (var i = 0; i < jo.length; i++) {
                if (EncodeHtml(jo[i].name) == ID) {
                    jo.splice(i, 1);
                    _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                    $wrap.iAttLoadList();
                    return;
                }
            }
            return;
        }
        var SavePath = $wrap.attr('savepath') || '';
        var IsPathMode = $wrap.attr('ispathmode') === 'true';

        var url;
        if (IsPathMode) {
            url = "/api/icontrols/iAttachmentData/DeleteAttByPath?Savepath=" + SavePath + "&FileName=" + encodeURIComponent(ID);
        }
        else {
            url = "/api/icontrols/iAttachmentData/DeleteAtt?ID=" + ID;
        }
        $.ajax({
            type: "GET",
            url: url,
            cache: false,
            success: function (ret) {
                _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                $wrap.iAttLoadList();
            }
        });
    };

    $.fn.iAttSendFiles = function (MethodName, Args, _callback) {
        var $this = $(this);
        _miss_fun.iAttFileSelected('custsendfile', $this, { MethodName: MethodName, Args: Args, _callback: _callback });
        return $this;
    };

    $.fn.iAttLoadList = function () {
        var $wrap = $(this);
        var $ctr = $wrap.find('.ictr-input');
        var showasimgs = $wrap.attr('showasimgs') || 'false';

        if ($wrap.attr('IsCustomUpload') == 'true') {
            var jo = _miss_fun._iAttURLData[$wrap.attr('id')];
            if (!jo) return;
            var attList = '';
            var ImgWidth = $wrap.attr('ImgWidth') || '80';
            var ImgHeight = $wrap.attr('ImgHeight') || '80';
            var ImgTitleStyle = $wrap.attr('ImgTitleStyle') || 'FullNameWithSize';
            for (var i = 0; i < jo.length; i++) {
                if (showasimgs === 'true') {
                    attList += '<div class="imgItem" FileID="' + EncodeHtml(jo[i].name) + '" style="width:' + (parseFloat(ImgWidth) + 2)
                        + 'px;" title="' + jo[i].name + '(' + jo[i].size + ')">';
                    attList += '<span class="xiconfont xicon-cancel deleteFile"></span>';
                    attList += '<img tabIndex="99" style="width:' + ImgWidth + 'px;height:' + ImgHeight + 'px;" src="' + jo[i].data + '" />';

                    if (ImgTitleStyle && ImgTitleStyle !== 'none') {
                        var title = jo[i].name;
                        if ((ImgTitleStyle === 'Name' || ImgTitleStyle === 'NameWithSize') && title.indexOf('.') > 0) {
                            title = title.substr(0, title.lastIndexOf('.'));
                        }
                        if (title.length > 8) title = title.substr(0, 8);
                        attList += '<div class="imgTitle">' + title + '</div>';

                        if (ImgTitleStyle === 'FullNameWithSize' || ImgTitleStyle === 'NameWithSize') {
                            attList += '<div class="imgTitle" style="color:gray;">(' + jo[i].size + ')</div>';
                        }
                    }
                    attList += '</div>';
                }
                else {
                    var rawfname = jo[i].name;
                    var fname = rawfname;
                    var fext = '';
                    if (fname.indexOf('.') > 0) {
                        fext = fname.substr(fname.lastIndexOf('.'));
                        fname = fname.substr(0, fname.lastIndexOf('.'));
                    }
                    if (fname.length > 8) fname = fname.substr(0, 8);
                    fname += fext;
                    attList += '<a FileID="' + EncodeHtml(jo[i].name) + '" href="' + jo[i].data + '" _download="true" target="_blank" title="'
                        + EncodeHtml(rawfname) + '">' + fname +
                        '<span>(' + jo[i].size + ')</span>';

                    attList += '<span class="xiconfont xicon-cancel deleteFile"></span>';
                    attList += '</a>';
                }
            }
            if (showasimgs === 'true' && !(jo.length > 0 && parseInt($wrap.attr('maxcount') || 0) == 1)) {
                attList += '<div class="imgAdd" style="width:' + (parseFloat(ImgWidth) + 2) + 'px;height:' + (parseFloat(ImgHeight) + 2) + 'px;line-height:' + (parseFloat(ImgHeight) - 8)
                    + 'px;"><span class="add">+</span>';
                if (!$.browser.isPhone) attList += '<span class="more" title="更多选项（截图/修图/手机拍照）"></span>';
                attList += '</div>';
            }

            $ctr.html(attList);
            var h = Math.max($ctr.outerHeight() + 1, 21);
            $wrap.find('.xiconfont:not(.deleteFile,.showFile)').css({ 'height': h + "px" });
            _miss_fun.SetiItemTitleHeight();
            return;
        }

        var DocKey = $wrap.attr('dockey') || '';
        var ModuleKey = $wrap.attr('modulekey') || '';
        var SubKey = $wrap.attr('subkey') || '';
        if (/\{\{(.*?)\}\}/.test(DocKey)) return $wrap;
        if (/\{\{(.*?)\}\}/.test(ModuleKey)) return $wrap;
        if (/\{\{(.*?)\}\}/.test(SubKey)) return $wrap;

        var oldAtt = $wrap.attr('old-att') === 'true' ? true : false;
        var oldDocKey = $wrap.attr('old-dockey') || '';
        var oldModuleKey = $wrap.attr('old-moduleKey') || '';
        var oldSubKey = $wrap.attr('old-subkey') || '';
        var oldRecover = $wrap.attr('old-recover') || '';
        var oldMiss = $wrap.attr('old-miss') || '';
        if (/\{\{(.*?)\}\}/.test(oldDocKey)) return $wrap;
        if (/\{\{(.*?)\}\}/.test(oldModuleKey)) return $wrap;
        if (/\{\{(.*?)\}\}/.test(oldSubKey)) return $wrap;

        var AllowDelete = $wrap.attr('allowdelete') || 'true';
        var AllowDownload = $wrap.attr('AllowDownload') || 'true';
        var AllowUpload = $wrap.attr('allowupload') || 'true';
        var isDisabled = $wrap.attr('isdisabled') || 'false';;
        var Inline = $wrap.attr('Inline') || 'false';

        var SavePath = $wrap.attr('savepath') || '';
        var filter = $wrap.attr('filter') || '';
        var IsPathMode = $wrap.attr('ispathmode') === 'true';

        if (filter && filter.substring(0, 4) == 'fun:') {
            filter += '|' + svr._currentAssembly;
        }

        var data, url;
        if (IsPathMode) {
            if (!SavePath) return $wrap;
            data = { SavePath: SavePath, filter: filter, DocKey: DocKey };
            url = "/api/icontrols/iAttachmentData/GetAttListByPath";
        }
        else {
            data = {
                ModuleKey: ModuleKey, DocKey: DocKey, SubKey: SubKey,
                oldAtt: oldAtt, oldModuleKey: oldModuleKey, oldDocKey: oldDocKey, oldSubKey: oldSubKey,
                oldRecover: oldRecover, oldMiss: oldMiss,
                filter: filter
            };
            url = "/api/icontrols/iAttachmentData/GetAttList";
        }
        $.ajax({
            type: "GET",
            url: url,
            cache: false,
            data: data,
            success: function (ret) {
                var jo = $.JsonObject(ret);
                var attList = '';
                var htmlHref = '#';
                var ImgWidth = $wrap.attr('ImgWidth') || '80';
                var ImgHeight = $wrap.attr('ImgHeight') || '80';
                var ImgTitleStyle = $wrap.attr('ImgTitleStyle') || 'FullNameWithSize';
                for (var i = 0; i < jo.length; i++) {
                    if (showasimgs === 'true') {
                        htmlHref = '/attfiles/I' + jo[i].downurl;
                        attList += '<div class="imgItem" FileID="' + (IsPathMode ? EncodeHtml(jo[i].FileName) : jo[i].ID) + '" style="width:' + (parseFloat(ImgWidth) + 2)
                            + 'px;" title="' + jo[i].FileName + '(' + jo[i].FileSize + ')\r\n上传时间:' + jo[i].Date + '">';
                        if (AllowDelete !== "false" && isDisabled !== "true" && !jo[i].type) {
                            attList += '<span class="xiconfont xicon-cancel deleteFile"></span>';
                        }
                        attList += '<img tabIndex="99" style="width:' + ImgWidth + 'px;height:' + ImgHeight + 'px;" src="' + htmlHref + '" />';

                        if (ImgTitleStyle && ImgTitleStyle !== 'none') {
                            var title = jo[i].FileName;
                            if ((ImgTitleStyle === 'Name' || ImgTitleStyle === 'NameWithSize') && title.indexOf('.') > 0) {
                                title = title.substr(0, title.lastIndexOf('.'));
                            }
                            if (title.length > 8) title = title.substr(0, 8);

                            attList += '<div class="imgTitle">' + title + '</div>';

                            if (ImgTitleStyle === 'FullNameWithSize' || ImgTitleStyle === 'NameWithSize') {
                                attList += '<div class="imgTitle" style="color:gray;">(' + jo[i].FileSize + ')</div>';
                            }
                        }
                        attList += '</div>';
                    }
                    else {
                        var attType = jo[i].type;
                        var attStyle = "";
                        if (attType == 'miss')
                            attStyle = " style='color:green;'";
                        else if (attType == 'old')
                            attStyle = " style='color:gray;'";
                        if (AllowDownload !== 'false' || isDisabled !== 'true') htmlHref = '/attfiles/' + (Inline === 'true' ? 'I' : 'A') + jo[i].downurl;

                        var fname = jo[i].FileName;
                        var fext = '';
                        if (fname.indexOf('.') > 0) {
                            fext = fname.substr(fname.lastIndexOf('.'));
                            fname = fname.substr(0, fname.lastIndexOf('.'));
                        }
                        if (fname.length > 10) fname = fname.substr(0, 10) + "~";
                        fname += fext;

                        attList += '<a' + attStyle + ' FileID="' + (IsPathMode ? EncodeHtml(jo[i].FileName) : jo[i].ID) + '" href="' + htmlHref
                            + '" _download="true" target="_blank" title="' + EncodeHtml(jo[i].FileName) + '">' + fname
                            + '<span>(' + jo[i].FileSize + ')</span>';

                        var lastDot = htmlHref.lastIndexOf('.');
                        if (lastDot > 0) {
                            var fileExt = (htmlHref.substr(lastDot + 1) || '').toLocaleLowerCase();
                            if (["jpg", "jpeg", "png", "gif", "tiff", "bmp", "webp", "pdf", "txt", "mp3", "mp4", "mov",
                                "docx", "dotx", "doc", "dot", "xlsx", "xlsm", "xlsb", "xls", "pptx", "ppsx", "ppt", "pps", "potx", "ppsm"].indexOf(fileExt) >= 0) {
                                attList += '<span class="xiconfont xicon-show showFile" title="' + lang('预览', 'Preview') + '" url="' + decodeURIComponent(htmlHref) + '" style="margin-right:2px;margin-left:2px;color:green;"></span>';
                            }
                        }

                        if (AllowDelete !== "false" && isDisabled !== "true" && !jo[i].type) {
                            attList += '<span class="xiconfont xicon-cancel deleteFile" title="' + lang('删除', 'Delete') + '"></span>';
                        }
                        attList += '</a>';
                    }
                }
                if (showasimgs === 'true' && isDisabled !== 'true' && AllowUpload !== 'false'
                    && !(jo.length > 0 && parseInt($wrap.attr('maxcount') || 0) == 1)) {
                    attList += '<div class="imgAdd" style="width:' + (parseFloat(ImgWidth) + 2) + 'px;height:' + (parseFloat(ImgHeight) + 2) + 'px;line-height:' + (parseFloat(ImgHeight) - 8)
                        + 'px;"><span class="add">+</span>';
                    if (!$.browser.isPhone) attList += '<span class="more" title="更多选项（截图/修图/手机拍照）"></span>';
                    attList += '</div>';
                }
                $ctr.html(attList);
                var h = Math.max($ctr.outerHeight(), 21);
                $wrap.find('.xiconfont:not(.deleteFile,.showFile)').css({ 'height': h + "px" });
                _miss_fun.SetiItemTitleHeight();
            }
        });

        return $wrap;
    };

    $.fn.iAttUpdateTempKey = function (DocKey) {
        var $wrap = $(this);
        var ModuleKey = $wrap.attr('ModuleKey') || '';
        if (DocKey)
            $wrap.attr('DocKey', DocKey);
        else
            DocKey = $wrap.attr('DocKey') || '';

        var url = "/api/icontrols/iAttachmentData/UpdateTempKey?ModuleKey=" + ModuleKey + "&Dockey=" + DocKey;
        $.ajax({
            type: "GET",
            url: url,
            cache: false
        }).done(function () {
            $wrap.iAttLoadList();
        });
    }

    $.fn.openImg = function (title) {
        var $img = $(this);
        var imgurl = $img.attr('raw-src') || $img.attr('src');
        if (!imgurl) return;


        if (imgurl.indexOf('https:') !== 0 && imgurl.indexOf('http:') !== 0) {
            var thisPagehref = location.href;
            if (imgurl.substring(0, 1) !== "/" && imgurl.substring(0, 1) !== "\\") {
                var lastindext = thisPagehref.lastIndexOf('/');
                imgurl = thisPagehref.substr(0, lastindext) + "/" + imgurl;
            }
            else {
                var lastindext = thisPagehref.indexOf('/', 8)
                imgurl = thisPagehref.substr(0, lastindext) + imgurl;
            }
        }

        var $topBody = $(window.top.document.body);
        $topBody.find('.PickerWrap-Img').remove();

        var image = new Image();
        image.onload = function () {
            if (image._loaded) return;
            image._loaded = true;
            var $imgform = $('<div class="PickerWrap-Img" style="z-index:1980000"></div>');
            if ($.browser.isApp) $imgform.append('<div class="saveimg" tabIndex="999" style="cursor:pointer; position:absolute;z-index:1;border:1px solid blue;border-radius:5px;padding:2px;line-height:18px;color:blue;background-color:rgba(0,0,0,0.2);">保存到相册</div>');
            var maxWidth = Math.min(600, innerWidth - 10), maxHeight = Math.min(600, innerHeight - 10), w, h;
            w = image.width;
            h = image.height;

            if (w < 200 && h < 200) {
                h = h * 200 / w;
                w = 200;
            }
            if (w > maxWidth || h > maxHeight) {
                if (maxWidth / maxHeight <= w / h) {
                    h = h * maxWidth / w;
                    w = maxWidth;
                }
                else {
                    w = w * maxHeight / h;
                    h = maxHeight;
                }
            }
            image.width = w;
            image.height = h;
            $imgform.append(image);
            if (title) $imgform.append("<div>" + title + "</div>");
            $imgform.click(function (event) {
                event = event || window.event;
                var srcEle = event.srcElement ? event.srcElement : event.target;
                if (srcEle === $imgform.find('>div.saveimg')[0]) return;
                if (window.top && window.top.document) $(window.top.document.body).find('.PickerWrap-Img').zoomClose(150);
            });

            $img.off('blur').blur(function () {
                setTimeout(function () {
                    if (window.top.document.activeElement === $imgform.find('>div.saveimg')[0]) return;
                    $imgform.zoomClose(150);
                }, 100);
            });
            $imgform.find('>div.saveimg').off('click').click(function () {
                app.invoke('savepicture:' + imgurl);
                setTimeout(function () {
                    $img.focus();
                }, 200);
            });

            $imgform.zoomOpen({ $parent: $topBody, speed: 150 });
        };
        image.src = imgurl;
    };

    //-- iEditor --------------------------------------------------------------------------------

    $.fn.iCode = function () {
        var $wrap = $(this);

        var texttype = $wrap.attr('texttype');

        if (texttype == 'editor') {
            var image_upload_handler = function (blobInfo, progress) {
                return new Promise(function (resolve, reject) {

                    var blob = blobInfo.blob(), reader = new FileReader();
                    reader.onload = function (e) {
                        //压缩图片
                        var img = new Image();
                        img.onload = function () {
                            var data = $.compressImage(img, 640 * 480);
                            resolve(data)
                        };
                        img.src = this.result;
                    };
                    reader.readAsDataURL(blob);
                });
            }

            tinymce.init({
                selector: '#' + $wrap.attr('id') + '_body',
                inline: true,
                images_upload_handler: image_upload_handler,
                language: 'zh_CN',
                statusbar: false,
                toolbar_mode: 'floating',
                height: "100%",
                menubar: false,
                readonly: $wrap.attr('isdisabled') == "true",
                font_family_formats: 'Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Consolas=Consolas;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats;宋体=宋体;黑体=黑体;楷体=楷体_GB2312;隶书=隶书',
                plugins: [
                    'advlist', 'autolink', 'lists',
                    'anchor', 'visualblocks', 'fullscreen', 'table', 'code',
                    'link', 'image', 'quickbars'
                ],
                toolbar: 'code undo redo imggroup table fontfamily fontsize styles formatting color alignment bullist numlist',
                toolbar_groups: {
                    formatting: {
                        icon: 'bold',
                        tooltip: '文字格式',
                        items: 'bold italic underline strikethrough | superscript subscript | removeformat',
                    },
                    color: {
                        icon: 'highlight-bg-color',
                        tooltip: '颜色',
                        items: 'backcolor forecolor',
                    },
                    alignment: {
                        icon: 'align-center',
                        tooltip: '对齐方式',
                        items: 'alignleft aligncenter alignright alignjustify | outdent indent',
                    },
                    imggroup: {
                        icon: 'image',
                        tooltip: '插入图片',
                        items: 'quickimage image',
                    }
                }
            });
            return;
        }

        var editorId = $wrap.attr('_Code_Editor_InstanceID');
        if (editorId && window[editorId]) {
            if (texttype === 'code') window[editorId].refresh();
            return;
        }

        editorId = "itext_code_instance_" + Math.random().toString().substr(2);
        $wrap.attr('_Code_Editor_InstanceID', editorId);

        if (texttype === 'code') {
            var mime = "text/x-mssql";
            switch ($wrap.attr('mode')) {
                case 'sql':
                    mime = "text/x-mssql";
                    break;
                case 'csharp':
                    mime = "text/x-csharp";
                    break;
                case 'json':
                    mime = "application/json";
                    break;
                case 'javascript':
                    mime = "text/typescript";
                    break;
                case 'html':
                    mime = "text/html";
                    break;
            }
            var txt = $wrap.find('>textarea')[0];
            window[editorId] = CodeMirror.fromTextArea(txt, {
                mode: mime,
                indentWithTabs: true,
                smartIndent: true,
                lineNumbers: true,
                matchBrackets: true,
                autofocus: true
            });
        }
        else if (texttype === 'markdown') {
            window[editorId] = editormd($wrap.attr('id') + "_editormd", {
                width: "100%",
                height: "100%",
                syncScrolling: "single",
                placeholder: null,
                saveHTMLToTextarea: true,
                path: "/lib/editormd/lib/"
            });
        }
    };

    $.fn.iPicker = function (html, width, height, _callbackFun) {
        var $wrap = $(this);

        if ($wrap.attr('iPickerInitialized') === 'true') return $wrap;
        $wrap.attr('iPickerInitialized', 'true');

        if (!$.browser.isPhone && $wrap.attr('menu-trigger') === 'mouseenter') {
            $wrap.on({
                mouseenter: function (evt) {
                    var $target = $((window.event || evt).target);
                    if ($target.parentUntil(function ($t) { return $t.hasClass('dropdown-menu') }, 4).length > 0) return;
                    $wrap.openiPicker(html, width, height, _callbackFun);
                },
                mouseleave: function () {
                    $('.dropdown-menu').remove();
                }
            });
        }
        else if ($wrap.attr('menu-trigger') === 'longtap') {
            $wrap.off('longtap').longtap(function () {
                if ($wrap.attr('ismenuing') != 'true') {
                    $wrap.openiPicker(html, width, height, _callbackFun);
                    $wrap.attr('ismenuing', 'true');
                }
                return false;
            });
            $wrap.click(function () {
                if ($wrap.attr('ismenuing') === 'true') {
                    $('.dropdown-menu').remove();
                    $wrap.removeAttr('ismenuing');
                }
            });
        }
        else {
            $wrap.off('click').click(function () {
                if ($wrap.attr('ismenuing') === 'true') {
                    $('.dropdown-menu').remove();
                    $wrap.removeAttr('ismenuing');
                }
                else {
                    $wrap.openiPicker(html, width, height, _callbackFun);
                    $wrap.attr('ismenuing', 'true');
                }
                return false;
            });
        }
        return $wrap;
    };

    $.fn.openiPicker = function (html, width, height, _callbackFun) {

        if (width && width.constructor === Function) {
            _callbackFun = width;
            width = '';
            height = '';
        }
        else if (height && height.constructor === Function) {
            _callbackFun = height;
            height = '';
        }
        var style = '';
        if (width) style += 'width:' + width + 'px;';
        if (height) height += 'height:' + height + 'px;';

        var $wrap = $(this);

        if ($wrap.attr('ismenuing') === 'true') closePicker();

        var htmlContext = html;
        if (html && html.constructor === Function) htmlContext = html();

        var ss = $('<div class="PickerWrap shadow" style="' + style + '"></div>').append(htmlContext);
        var childpicker = $('<div class="dropdown-menu picker"></div>').append(ss);

        childpicker.find('.PickerItem').mousedown(function () {
            var $this = $(this);
            var val = $this.attr('val');
            _callbackFun && _callbackFun(val, $this);
            closePicker();
        });

        //childpicker位置
        var options = { isInCtr: true, offTop: 0, align: $wrap.attr('menu-align') || '', isMenu: true };
        _miss_fun.showChildpicker($wrap, childpicker, options);
        childpicker.on('blur', function () { $wrap.blur(); });
        $wrap.append(childpicker);

        $("body").one('mousedown', function (event) {
            setTimeout(function () {
                closePicker();
            }, 100);
        });

        return $wrap.blur(function () {
            setTimeout(function () {
                var $actEl = $(document.activeElement);
                if ($actEl[0] === $wrap[0]) return;

                if ($actEl.parentUntil(function ($t) { return $t.hasClass('dropdown-menu') }, 4).length > 0) return;

                if (_callbackFun) _callbackFun(null, null);
                closePicker();
            }, 0);
        });
        function closePicker() {
            $('.dropdown-menu').remove();
            $wrap.removeAttr('ismenuing');
        }
    };

    $.fn.iColorPicker = function (_callbackFun, isRun) {
        var table = $('<table class="iColor" cellpadding="0" cellspacing="0" style="width:220px;"></table>');

        var t = '<tbody><tr><td c="255,255,255$0,1,0$231,229,230$68,85,105$91,156,214$237,125,49$165,165,165$255,192,1$67,113,198$113,174,71@242,242,242$127,127,127$208,206,207$213,220,228$222,234,246$252,229,213$237,237,237$255,242,205$217,226,243$227,239,217@216,216,216$89,89,89$175,171,172$173,184,202$189,215,238$247,204,172$219,219,219$255,229,154$179,198,231$197,224,179@191,191,191$63,63,63$117,111,111$133,150,176$156,194,230$244,177,132$201,201,201$254,217,100$142,170,218$167,208,140@165,165,165$38,38,38$58,56,57$51,63,79$46,117,181$196,90,16$123,123,123$191,142,1$47,85,150$83,129,54@127,127,127$12,12,12$23,21,22$34,42,53$31,78,122$132,60,10$82,82,82$126,96,0$32,56,100$54,86,36@192,0,0$254,0,0$253,193,1$255,255,1$147,208,81$0,176,78$1,176,241$1,112,193$1,32,96$112,48,160"></td></tr></tbody>';

        table.append(t.replace(/\$/g, '"></td><td c="').replace(/\@/g, '"></td></tr><tr><td c="'));
        table.find('td').addClass('PickerItem').each(function () {
            $(this).css('background-color', 'rgb(' + $(this).attr('c') + ')');
        });

        if (isRun) {
            $(this).openiPicker(table, function (ret, $pickeritem) {
                if (!$pickeritem) return;
                if (_callbackFun) _callbackFun($pickeritem.css('background-color'));
            });
        }
        else {
            $(this).iPicker(table, function (ret, $pickeritem) {
                if (!$pickeritem) return;
                if (_callbackFun) _callbackFun($pickeritem.css('background-color'));
            });
        }
    };

    //-- Others ---------------------------------------------------------------------------------

    $.fn.iWarning = function (title, state) {

        var $wrap = $(this);
        var iWarningID = $wrap.attr('iWarningID');
        if (title === false && iWarningID) {
            $('#' + iWarningID).remove();
            return;
        }

        if (arguments.length === 0) {
            title = lang(20);
            state = true;
        } else if (arguments.length === 1) {
            if (title === false) {
                state = false;
            }
            else if (title === null || title === "" || title.constructor === String) {
                title = title || lang(20);
                state = true;
            }
            else {
                state = title ? true : false;
                title = lang(20);
            }
        }

        if (!iWarningID) {
            iWarningID = 'iWarningID' + Math.random().toString().replace('.', '').replace('-', '');
            $wrap.attr('iWarningID', iWarningID);
        }
        else {
            $('#' + iWarningID).remove();
        }

        if (state === false) return;


        var imgData = "data:image/gif;base64,R0lGODlhFwAXANU/ALRtbf37+9yysqMyMteMjJwxMfDY2OFNTdulpdVFRaYsLOvS0pkuLtxKSupWVvXt7c88PLoxMe5ZWe7c3OS8vN6srMdqauvLy7JWVsZaWs2oqOCNjdtpafFeXudhYcqGhqdQUPPm5sY5OeXDw6wwMMh9feZSUpUuLueyspIoKNtFRZQrK7AtLZEuLunExMI0NPRgYKxAQNdISNp9fZ46OvLNzcuVlaszM81AQMc8PLQ1NcA5Obk3N680NP///////yH5BAEAAD8ALAAAAAAXABcAAAb/wJ9w+AtMKIQNATF6EJ/DwGjm6cCsVw/CCRU+Nh6JeEz2ULoGjsTBbrvZJpSP+OA4THj8oXHI5w9nQj4zJgeGhyg1KIeMMiFCFw2Skw0yBj4hlJMqMwEBHAmhogk4Cz4To6M4BhM4rq+uIhc+BrCwEAQCIjm8vTkvLj4Lu768IhYlIjvLzDsRFD4XEc3NGQQRPNnaPCxyLtjb2hklOuXm5SwVPhQs5+cZCCw98/Q9Cgg+Agr19CQWCyRuCBx4g0QMDDECEhRI4kMADAoGSJw44MMIGxQpkrjwQ19GBjEe+HjIgGIBBRYCFMHAoIDLAi2hLaDR8mUBEhOGhGDAs+eKPQIYaKzoyeDEvScTCqQ4wfTEihQrmjJV4BDKBBApWmjdurWkAJVdAmgQuuIp1JIAuHTRqQGAW7c2FoAlEgQAOw==";

        var $html = $('<div id="' + iWarningID + '" title="' + title + '" class="iwarning"><img style="width:14px;height:14px;float:left;cursor:pointer;" src="' + imgData + '" /></div>')
            .css({ 'position': 'absolute', 'display': 'none' })
        $wrap.append($html);

        $wrap.find('#' + iWarningID + '>img').off('click').click(function () {
            $wrap.find('#' + iWarningID).hide(300);
            setTimeout(function () { $wrap.find('#' + iWarningID).remove(); }, 300);
        });
        if ($wrap[0] === document.body) {
            $wrap.find('#' + iWarningID).css({ 'position': 'fixed', 'top': '0px', 'left': '0px', 'z-index': '900', 'border': '1px solid yellow', 'border-radius': '50%' }).show();
            $wrap.find('#' + iWarningID + '>img').css({ 'transition': 'all 0.2s', 'height': '20px', 'width': '20px' });
            setTimeout(function () { $wrap.find('#' + iWarningID + '>img').css({ 'height': '14px', 'width': '14px' }); }, 200);
            setTimeout(function () { $wrap.find('#' + iWarningID + '>img').css({ 'height': '20px', 'width': '20px' }); }, 400);
        }
        else {
            $wrap.iActive();
            $wrap.find('#' + iWarningID).css({ 'top': '3px', 'right': '-15px', 'z-index': '900', 'border': '1px solid yellow', 'border-radius': '50%' }).show();
        }
    };

    //将控件闪一闪
    $.fn.iActive = function (IsFocus) {
        if (IsFocus) {
            $('.focus').removeClass("focus");
            $('.button-focus').removeClass("button-focus");
            $this.find('input').focus();
        }
        var $this = $(this).addClass('ictr-active');
        setTimeout(function () {
            $this.removeClass('ictr-active');
        }, 1200);
        return $this;
    }

    $.fn.iTips = function (content, icontype) {
        var $wrap = $(this);
        var iTipsID = $wrap.attr('iCtrliTipsID');
        if (arguments.length === 0) content = $wrap.attr('itips');
        if (!content) {
            if (iTipsID) {
                $wrap.removeAttr('isTipsing');
                $('#' + iTipsID).remove();
            }
            $wrap.find('[isTipsing]').each(function () {
                var $this = $(this);
                iTipsID = $this.attr('iCtrliTipsID');
                $this.removeAttr('isTipsing');
                $('#' + iTipsID).remove();
            });
            return;
        };

        if ($wrap.attr('isTipsing')) return;
        $wrap.attr('isTipsing', true);

        if (!iTipsID) {
            iTipsID = 'iCtrliTipsID' + Math.random().toString().replace('.', '').replace('-', '');
            $wrap.attr('iCtrliTipsID', iTipsID);
        }
        else
            $('#' + iTipsID).remove();

        var $html = $('<div id="' + iTipsID + '" class="iTips"></div>');
        var $content = $('<span class="content">' + content + '</span>');

        if (icontype) {
            $html.append('<span class="xiconfont xicon-' + icontype + '"></span>');
            $content.css('padding-left', '29px');
        }
        $html.append($content).append('<div class="arrow top"></div>')
            .on("click", function () {
                $html.zoomClose(100);
                $wrap.removeAttr('isTipsing');
            });
        $('body').append($html);

        //childpicker位置
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        var pickerWidth = $html.outerWidth();
        if (pickerWidth > windowWidth - 30) {
            pickerWidth = windowWidth - 30;
            $html.outerWidth(pickerWidth);
            $html.find('>span.content').css('white-space', 'normal');
        }

        var scrollTop = $(document).scrollTop();
        var pickerHeight = $html.outerHeight();

        var poffset = $wrap.offset();
        var dpTop = $wrap.outerHeight() + poffset.top + 8;
        var dpLeft = poffset.left;
        if (dpLeft > windowWidth - pickerWidth - 18) dpLeft = windowWidth - pickerWidth - 18;

        if (dpTop + pickerHeight > windowHeight + scrollTop) {
            dpTop = poffset.top - pickerHeight - 10;
            if (dpTop < scrollTop) {
                dpTop = scrollTop;
                $html.find('.arrow').removeClass('bottom').removeClass('top');
            }
            else {
                $html.find('.arrow').removeClass('top').addClass('bottom');
            }
        }
        var arrowleft = poffset.left - dpLeft + 6;
        $html.find('.arrow').css('left', arrowleft + 'px');

        $html.zoomOpen({ $parent: 'none', top: dpTop, left: dpLeft, speed: 100 });
    };

    $.fn.iTabs = function (index) {
        //index为空，则选择第一个（0）
        var $wrap = $(this);
        if (!$wrap.attr('bindResizeEvent')) {
            $wrap.ResizeContainer(function () {
                setTimeout(function () {
                    var $header = $wrap.find('>.header').outerHeight(25);
                    if ($header.length === 0) return;
                    var oh = $header[0].scrollHeight - 1;
                    if (oh === -1) oh = 25;
                    $header.outerHeight(oh).css('margin-top', '-' + oh + 'px');
                    $wrap.css('padding-top', oh + 'px');
                }, 100);
                setOverflowY($wrap.find('>.panels').find('>div:eq("' + $wrap.ival() + '")'));
            });
            $wrap.attr('bindResizeEvent', 'true');
        }

        var $ul = $wrap.find('>.header>ul');
        if (!index && index !== 0) {
            index = -1;
            $ul.find('>li').each(function (i) {
                if ($(this).css('display') !== 'none') {
                    index = i;
                    return false;
                }
            })
        }

        $ul.find('>li').removeAttr('selected');
        $ul.find('>li:eq("' + index + '")').attr('selected', 'selected');

        var $panels = $wrap.find('>.panels');
        $panels.find('>div').hide();
        var $p = $panels.find('>div:eq("' + index + '")').css('display', 'block');

        //恢复原始overflow-y
        if (!$p.attr('_rawoverflowy')) $p.attr('_rawoverflowy', $p.css('overflow-y'));
        $p.css('overflow-y', 'hidden');

        var text = $ul.find('>li[selected]').text();
        //触发AfterChange事件
        $wrap.triggerHandler('AfterChange', [index, text]);
        if (_miss_fun.fnIsExist("AfterChange")) AfterChange($wrap, $wrap.attr('id'), index, text);
        $.each(ictr._rundata_.afterChange, function () { this($wrap, $wrap.attr('id'), index, text); });

        if (!$p.attr('_isTabsPanelloaded')) {
            $p.attr('_isTabsPanelloaded', 'true');
            $.each(ictr._rundata_.itabsPanelLoad, function () { this($wrap, index, text); });
            $p.find('div[ctrtype="iGridView"]').each(function () {
                var $this = $(this);
                if ($this.attr('isloaded') === 'true' && $this.attr('EditMode') !== 'all') {
                    $this.iGridView('reload');
                }
            });
            //iCode Refresh
            _miss_fun.iCodeRefresh();
        }

        if (arguments.length == 2 && arguments[1]) return $wrap;
        $.WhenAjaxDone(function () {
            $('div[autosize-bottom]').each(function () { $(this).AutosizeBottom(); });
            var rawHeight = $wrap.attr('rawHeight'); //原始设定高度
            if (!$wrap.attr('autosize-bottom') && rawHeight) {
                $wrap.outerHeight(rawHeight);
            }
            var scrollHeight = $wrap[0].scrollHeight - 2;
            if (rawHeight && scrollHeight > $wrap.outerHeight() && $p.css('overflow-y') === 'visible') {
                $wrap.outerHeight(scrollHeight + 9);
            }
            setOverflowY($p);
            $p.iCtrSetHeight();
            _miss_fun.SetiItemTitleHeight($p);
        }, 100);
        return $wrap;

        function setOverflowY($p) {
            var st = $p.scrollTop();
            $p.scrollTop(10);
            if ($p.scrollTop() < 5 && $p.scrollTop() > 0)
                $p.css('overflow-y', 'hidden');
            else
                $p.css('overflow-y', $p.attr('_rawoverflowy'));
            $p.scrollTop(st);
        }
    };

    $.fn.iTabsVisible = function (index, visible) {
        //index为空，则第一个（0）
        if (!index) index = 0;
        $wrap = $(this);
        var $ul = $wrap.find('>.header>ul');

        var $li;
        var $panel;
        if (index.toString().indexOf(',') > 0) {
            var indexs = index.split(',');
            var jqSele = '';
            var jqSelePanel = '';
            $.each(indexs, function (i, val) {
                jqSele += '>li:eq(' + val + '),';
                jqSelePanel += '>div:eq(' + val + '),';
            });
            $li = $ul.find(jqSele.substr(0, jqSele.length - 1));
            $panel = $wrap.find('>.panels').find(jqSelePanel.substr(0, jqSelePanel.length - 1));
        }
        else {
            $li = $ul.find('>li:eq("' + index + '")');
            $panel = $wrap.find('>.panels>div:eq("' + index + '")');
        }

        if (arguments.length < 2) {
            return $li.css('display') === 'none' ? false : true;
        }
        var $selectedli = $ul.find('>li[selected]');

        if (visible === 'reset') {
            $ul.find('>li').hide().attr('isHide', 'true');
            $wrap.find('>.panels>div').attr('isHide', 'true');
            $li.show().removeAttr('isHide');
            $panel.removeAttr('isHide');
        }
        else if (visible) {
            $li.show().removeAttr('isHide');
            $panel.removeAttr('isHide');
        }
        else {
            $li.hide().attr('isHide', 'true');
            $panel.attr('isHide', 'true');
        }
        if ($selectedli.css('display') === 'none') $wrap.iTabs();
        return $wrap;
    };

    $.fn.iTabsAddPanel = function (title, content) {
        $wrap = $(this);
        $wrap.find('.header>ul').append('<li><span class="title">' + title + '</span></li>');
        $wrap.find('.panels').append('<div>' + content + '</div>');
        return $wrap;
    };

    $.fn.iTabsGetPanel = function (idx) {
        if (arguments.length === 0 || idx === null || idx === undefined)
            idx = $(this).ival();
        return $(this).find('>.panels>div:eq(' + idx + ')')
    }

    $.fn.iCheckBox = function () {
        return $(this).each(function (k, v) {

            var $this = $(v);
            if ($this.is(':checkbox') && $this.attr('initialized') !== 'true' && $this.hasClass('slide')) {

                // add some data to this checkbox so we can avoid re-replacing it.
                $this.attr('initialized', 'true');

                var $l = $('label[for="' + $this.attr('id') + '"]');
                if ($l.length == 0) {
                    var sizeClass = "";
                    if ($this.hasClass("large"))
                        sizeClass = " large";
                    else if ($this.hasClass("xlarge"))
                        sizeClass = " large";

                    var highlight = $this.attr('highlight') || '';
                    $this.removeAttr('highlight');
                    if (highlight) highlight = ' highlight="' + highlight + '"';

                    var isdisabled = $this.attr('isdisabled') || 'false';
                    isdisabled = ' isdisabled="' + isdisabled + '"';

                    // create HTML for the new checkbox.
                    $l = $('<label for="' + $this.attr('id') + '" class="chkbox' + sizeClass + '"' + highlight + isdisabled + '></label>');
                    var $y = $('<span class="yes"></span>');
                    var $n = $('<span class="no"></span>');
                    var $t = $('<span class="toggle"></span>');

                    // insert the HTML in before the checkbox.
                    $l.append($y, $n, $t).insertBefore($this);
                }

                $this.addClass('replaced');

                // check if the checkbox is checked, apply styling. trigger focus.
                $this.on('change', function () {
                    if ($this.is(':checked'))
                        $l.addClass('on');
                    else
                        $l.removeClass('on');
                    $this.trigger('focus');
                    _miss_fun.triggerAfterChange($this);
                });

                $this.on('focus', function () { $l.addClass('focus'); });
                $this.on('blur', function () { $l.removeClass('focus'); });

                // check if the checkbox is checked on init.
                if ($this.is(':checked')) { $l.addClass('on'); }
                else { $l.removeClass('on'); }
            }
        });
    };

    $.iMenus = function (menus, evt, fun) { return $(document).iMenus(menus, evt, fun); };

    var _rawOncontextmenu = document.oncontextmenu;
    $.fn.iMenus = function (menus, evt, fun) {
        //menu-trigger: mouseenter/click?
        //menu-align: right/center/left?
        //hide-mode:jit mousedown后立即消失

        /*
         * [{id, title, icon, disabled, style, child:[]}]
         * id='-'：分隔符
         */

        if (!window._isAttachediMenuCloseEvent) {
            $('body').on({
                mousedown: function (evt) {
                    setTimeout(function () {
                        $('.dropdown-menu:not(.picker)').remove(); //关闭所有菜单
                    }, 210);
                }
            });
            window._isAttachediMenuCloseEvent = true;
        }

        var $this = $(this);
        var hidemode = $this.attr('hide-mode');

        if ($this[0] === document) {
            evt = evt || window.event;
            if (evt.button === 2) document.oncontextmenu = function () { return false; };
            ShowMenu($this, menus);
            setTimeout(function () { document.oncontextmenu = _rawOncontextmenu; }, 2000);
            window.returnValue = false;
            return false;
        }

        if (menus === false) {
            $this.attr('menu-off', 'true');
            return;
        }
        $this.removeAttr('menu-off');

        if (menus && menus.constructor === Function) {
            fun = menus;
            menus = null;
        }
        else if (evt && evt.constructor === Function) {
            fun = evt;
        }
        if (menus) $this.attr('menus', $.toJsonString(menus));

        if ($this.attr('iMenuInitialized') === 'true') return $this;
        $this.attr('iMenuInitialized', 'true');

        if (!$.browser.isPhone && $this.attr('menu-trigger') === 'mouseenter') {
            $this.on({
                mouseenter: function (evt) {
                    var $target = $((window.event || evt).target);

                    if ($target.parentUntil(function ($t) { return $t.hasClass('dropdown-menu') }, 4).length > 0) return;

                    if ($this.attr('menu-off') === 'true') return;
                    var menus = $this.attr('menus');
                    if (menus) ShowMenu($this, menus);
                },
                mouseleave: function () {
                    $('.dropdown-menu').remove();
                }
            });
        }
        else {
            $this.off('click').click(function () {
                if ($this.attr('ismenuing') === 'true') {
                    $('.dropdown-menu').remove();
                    $this.removeAttr('ismenuing');
                }
                else {
                    if ($this.attr('menu-off') === 'true') return;
                    var menus = $this.attr('menus');
                    if (menus) ShowMenu($this, menus);
                    $this.attr('ismenuing', 'true');
                }
                return false;
            });
        }

        return $this.blur(function () {
            setTimeout(function () {
                var $actEl = $(document.activeElement);
                if ($actEl[0] === $this[0]) return;

                if ($actEl.parentUntil(function ($t) { return $t.hasClass('dropdown-menu') }, 4).length > 0) return;

                $.each(ictr._rundata_.imenuClick, function () { this(null, null); });

                if (fun) fun(null, null);
                $('.dropdown-menu').remove();
            }, 0);
        });

        function ShowMenu($ctr, menuattr, isSub) {
            if (!menuattr) menuattr = $ctr.attr('menus');
            menuattr = $.JsonObject(menuattr);

            if (!isSub) $('.dropdown-menu').remove();
            //如所有菜单均无图标，则修改Padding-left
            var lipadding = ' style="padding-left: 15px;"';
            for (var i = 0; i < menuattr.length; i++) {
                if (menuattr[i].icon) {
                    lipadding = '';
                    break;
                }
            }
            var ulclass = " class='shadow" + (lipadding ? '' : ' imenu-iconsbg') + "'";
            var childpicker = $('<div class="dropdown-menu"><ul' + ulclass + '></ul></div>');
            var $ul = childpicker.find('>ul');

            for (i = 0; i < menuattr.length; i++) {
                var id = menuattr[i].id;
                var title = menuattr[i].title;
                var icon = menuattr[i].icon;
                var disabled = menuattr[i].disabled;
                var style = menuattr[i].style || '';
                if (style) style = ' style="' + style + '"';
                var child = $.toJsonString(menuattr[i].child);

                if (id === '-' || title === '-') {
                    $ul.append('<li divider></li>');
                }
                else {
                    var li = '<li id="' + id + '"' + lipadding + ((disabled === true || disabled === "true") ? ' disabled' : '');

                    if (child) {
                        li += " menu-trigger='mouseenter' menus='" + child + "'";
                    }

                    li += '>';

                    //图标
                    if (icon) {
                        if (icon.indexOf('xiconfont') >= 0 || icon.indexOf('fa-') >= 0 || icon.indexOf('svg') >= 0) {
                            if (icon.indexOf("svg-") >= 0 || icon.indexOf("svg_") >= 0) {
                                if (svgIcon && svgIcon.getIcon) {
                                    var iconName = icon.replace(/_/g, "-").replace('svg-icon', "").trim();
                                    var svgContent = svgIcon.getIcon(iconName, { strokeWidth: 4, size: 14 });
                                    li += '<span class="dropdownmenuicon svg-icon ' + iconName + '">' + svgContent + '</span>';
                                }
                            } else {
                                li += '<span class="dropdownmenuicon ' + icon + '"></span>';
                            }
                        }
                        else
                            li += '<span class="dropdownmenuicon xiconfont xicon-' + icon + '"></span>';
                    }
                    //标题
                    li += '<span class="imenutitle"' + style + '>' + title + '</span>';
                    //向右小箭头
                    if (child) li += '<span class="xiconfont xicon-page_next submenuicon" style="float:right;margin-right:-8px; color:gray;"></span>';

                    li += '</li>';
                    var $li = $(li);
                    if (child) {
                        $li.on({
                            mouseenter: function () {
                                ShowMenu($(this), null, true)
                            },
                            mouseleave: function () {
                                $(this).find('.dropdown-menu').remove();
                            }
                        });
                    }
                    $ul.append($li);
                }
            }

            if ($ctr[0] !== document) {
                childpicker.on('blur', function () { $ctr.blur(); });
                $ctr.append(childpicker);
            }
            else {
                $("body").append(childpicker);
            }
            //childpicker位置
            var windowHeight = window.innerHeight;
            var windowWidth = window.innerWidth;
            var scrollTop = $(document).scrollTop();
            var pickerHeight = childpicker.outerHeight();
            var pickerWidth = childpicker.outerWidth();

            var poffset, dpTop, dpLeft;

            if (isSub) {
                poffset = $ctr.offset();
                dpTop = poffset.top - 5;
                dpLeft = poffset.left + $ctr.parent().parent().outerWidth() - 4;

                if (dpTop + pickerHeight > windowHeight + scrollTop) {
                    dpTop = windowHeight + scrollTop - pickerHeight - 3;
                }
                if (dpLeft + pickerWidth > windowWidth) {
                    dpLeft = poffset.left - pickerWidth;
                }
            }
            else {
                if ($ctr[0] === document) {
                    evt = evt || window.event;
                    poffset = { left: evt.clientX, top: evt.clientY };
                    dpTop = poffset.top;
                }
                else {
                    poffset = $ctr.offset();
                    dpTop = $ctr.outerHeight() + poffset.top;
                }

                dpLeft = poffset.left;

                if (dpTop + pickerHeight > windowHeight + scrollTop) {
                    dpTop = poffset.top - pickerHeight + 2;
                }
                if (dpTop < scrollTop) dpTop = scrollTop;

                if (dpLeft + pickerWidth > windowWidth) {
                    dpLeft = windowWidth - pickerWidth - 4;
                }

                if ($ctr[0] !== document)  //下拉菜单右对齐
                {
                    if ($ctr.attr('menu-align') === 'right')
                        dpLeft = poffset.left + $ctr.outerWidth() - pickerWidth + 11;
                    else if ($ctr.attr('menu-align') === 'center')
                        dpLeft = poffset.left - (pickerWidth - $ctr.outerWidth() - 11) / 2;
                    if (dpLeft < 0) dpLeft = 0;
                }
            }

            childpicker.offset({ top: dpTop, left: dpLeft }).css('visibility', 'visible');

            $('li', $ul).on({
                mousedown: function () {
                    var $li = $(this);
                    var mid = $li.attr('id');
                    if ($li.attr('divider') !== undefined || $li.attr('disabled') !== undefined) return;
                    var $spanTitle = $li.find('>span.imenutitle');
                    $.each(ictr._rundata_.imenuClick, function () { this(mid, $spanTitle); });
                    if (mid && mid.substr(0, 1) == '#') { //按钮映射
                        $(mid).click();
                    }
                    else {
                        if (_miss_fun.fnIsExist("iButtonClick")) iButtonClick(mid);
                        if (mid && _miss_fun.fnIsExist(mid + '_click')) eval(mid + '_click();');
                    }

                    if (fun) fun(mid, $spanTitle);

                    if (hidemode == 'jit')
                        $('.dropdown-menu').remove();
                    else
                        setTimeout(function () { $('.dropdown-menu').remove(); }, 1200);
                },
                click: function () { setTimeout(function () { $('.dropdown-menu').remove(); }, 0); }
            });
            if ($ctr[0] === document) {
                $ul.blur(function () {
                    setTimeout(function () {
                        $.each(ictr._rundata_.imenuClick, function () { this(null, null); });
                        if (fun) fun(null);
                        $('.dropdown-menu').remove();
                    }, 200);
                }).focus();
            }
        }
    };

    $.fn.iTree = function (callback) {

        var $wrap = $(this);
        if (!$wrap || $wrap.length === 0) return $wrap;

        var itreestatus = $wrap.iTreeExpandStatus();
        $wrap.find('>.iTreeWrap').showLoading(true);
        var TreeArgs = {
            ctrID: $wrap.attr('ID'),
            QueryArgs: $wrap.attr('QueryArgs') || "",
            ExtAttr: $wrap.attr('ExtAttr') || '',
            action: svr._currentAssembly
        };
        var url = "/api/icontrols/iTreeData/GetData";
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            timeout: 7200000,
            url: url,
            data: { TreeArgs: $.toJsonString(TreeArgs) }
        }).done(function (ret) {
            $wrap.find('>.iTreeWrap').showLoading(false);
            if (ret.code == 0) {
                $wrap.find('>.iTreeWrap').html(ret.data);
                $wrap.iTreeExpandStatus(itreestatus);
                if ($wrap.attr('resetcheck') == 'true') _miss_fun.iTreeResetCheckboxStatus($wrap);
                if ($wrap.attr('disableparent') == 'true') _miss_fun.iTreeDisableParentCheckbox($wrap);
            }
            else {
                openAlert('error:' + ret.message);
            }
            if (callback) callback();
        });
        return $wrap;
    };

    $.fn.iTreeExpandOrCollapse = function (isExpand) {
        var $this = $(this);
        if (isExpand) {
            $this.find('.iTreeChild').show();
            $this.find('img').each(function () {
                var $img = $(this);
                var imgsrc = $img.attr('src');
                if (imgsrc.indexOf('plus.gif')) {
                    $img.attr('src', imgsrc.replace('plus.gif', 'minus.gif')).attr('isexpand', 'true');
                    var $expand = $img.parent().find('>[expandsrc]');
                    $expand.attr('src', $expand.attr('expandsrc'));
                }
            });
        }
        else {
            $this.find('.iTreeChild').hide();
            $this.find('img').each(function () {
                var $img = $(this);
                var imgsrc = $img.attr('src');
                if (imgsrc.indexOf('minus.gif')) {
                    $img.attr('src', imgsrc.replace('minus.gif', 'plus.gif')).attr('isexpand', 'false');
                    var $expand = $img.parent().find('>[expandsrc]');
                    $expand.attr('src', $expand.attr('closesrc'));
                }
            });
        }
    };

    $.fn.iTreeExpandStatus = function (val) {
        var $this = $(this);
        var $container = $this.attr('ctrtype') === 'itree' ? $this.parent() : $this;
        if (!val) { //获取
            var ss = [];
            $this.find('[fullkey]').each(function () {
                var $item = $(this);
                var expand = $item.find('>.iTreeItem>.iTreeLinesDV>img[isexpand]').attr('isexpand');
                ss.push([$item.attr('fullkey'), expand]);
            });
            var seleKey = '';
            var $selected = $this.find('[selected="selected"]');
            if ($selected.length > 0) {
                seleKey = $selected.parent().parent().attr('fullkey');
            }
            var scrollTop = $container.scrollTop();
            return { seleKey: seleKey, scrollTop: scrollTop, nodeStatus: ss };
        }
        else { //设置
            if (val.seleKey) {
                var $title = $this.find('[fullkey="' + val.seleKey + '"]>.iTreeItem>.iTreeTitleDV');
                if ($title.length > 0) _miss_fun.iTreeNodeTitleSelected($title);
            }
            var status = val.nodeStatus;
            for (var i = 0; i < status.length; i++) {
                var item = status[i];
                var $item = $this.find('[fullkey="' + item[0] + '"]');
                if ($item.length === 1) {
                    var $img = $item.find('>.iTreeItem>.iTreeLinesDV>img[isexpand]');
                    if ($img.length > 0) {
                        $img.attr('isexpand', item[1]);
                        if (item[1] === 'true') {
                            $img.attr('src', $img.attr('src').replace('plus.gif', 'minus.gif'))
                            $item.find('>.iTreeChild').show();
                        }
                        else {
                            $img.attr('src', $img.attr('src').replace('minus.gif', 'plus.gif'))
                            $item.find('>.iTreeChild').hide();
                        }
                    }
                }
            }
            $container.scrollTop(val.scrollTop);
            return $this;
        }
    };

    $.fn.showLoading = function (status) {
        var $this = $(this);
        if (status === false) {
            $this.find('>.loading-layout').remove();
            return;
        }
        var s = $this.iSize();
        var margintop = (s.height - 30) / 2;
        if (margintop < 0) margintop = 0;
        if (status === true) {
            $this.append("<div class='loading-layout' style='position:fixed;display:none;'><div style='text-align: center;margin-top: " + margintop + "px;'><img src='/images/Common/Info/loading.gif' /></div></div>");
            $this.find('>.loading-layout').css({ top: s.top + 'px', let: s.left + 'px', width: s.width + 'px', height: s.height + 'px' }).show();
        }
        else {
            $this.html("<div style='text-align: center;margin-top: " + margintop + "px;'><img src='/images/Common/Info/loading.gif' /></div>");
        }
    };

    //页面Resize时调整控件
    $.fn.ResizeContainer = function (callback) {
        var $ctr = $(this);
        var _LastResizeTime = null;
        $(function () { RunResize(); });

        $(window).resize(function () {
            RunResize();
            if (_LastResizeTime) clearTimeout(_LastResizeTime);
            _LastResizeTime = setTimeout(function () { RunResize(); }, 300);
        });

        function RunResize() {
            if ($ctr.length === 0) return;
            var isize = $ctr.iSize();
            callback.call($ctr, isize);
        }
    };

    //检测是否有横向或纵向滚动条
    $.fn.ScrollBarWidth = function (HorV) {
        if ($(this).length == 0) return 0;
        var ScrollBarWidth = 0;
        var _dbody = $(this)[0];

        if (HorV === "H" || HorV === "h") {
            var sl = _dbody.scrollLeft;
            _dbody.scrollLeft += sl > 0 ? -1 : 2;
            if (_dbody.scrollLeft !== sl) ScrollBarWidth = (_dbody.offsetHeight - _dbody.clientHeight); //滚动条宽度
            _dbody.scrollLeft = sl;
        } else {
            var sl = _dbody.scrollTop;
            _dbody.scrollTop += sl > 0 ? -1 : 2;
            if (_dbody.scrollTop !== sl) ScrollBarWidth = (_dbody.offsetWidth - _dbody.clientWidth); //滚动条宽度
            _dbody.scrollTop = sl;
        }
        return ScrollBarWidth;
    };

    $.fn.iSize = function () {
        var $this = $(this);
        var doc = $this[0].ownerDocument;
        var width = $this.outerWidth();
        var height = $this.outerHeight();
        var offset = $this[0] === document ? { left: 0, top: 0 } : $this.offset();
        return {
            width: width,
            height: height,
            left: offset.left,
            top: offset.top,
            right: offset.left + width,
            bottom: offset.top + height,
            winWidth: window.innerWidth || doc.body.clientWidth,
            winHeight: window.innerHeight || doc.body.clientHeight,
            scrollTop: $(doc).scrollTop(),
            scrollLeft: $(doc).scrollLeft()
        };
    };

    $.fn.FitHeight = function () {
        var $b = $(this);
        if ($b.length !== 1) return $b;
        var raw = $b.scrollTop();
        $b.scrollTop(10);
        var t = $b.scrollTop();
        if (t < 5) $b.outerHeight($b.outerHeight() + t);
        return $b.scrollTop(raw);
    };

    $.fn.FitParentHeight = function () {
        var $this = $(this);
        if ($this.length !== 1) return $this;
        var $b = $this.parent();
        var raw = $b.scrollTop();
        //var rawoverflowy = $b.css('overflow-y');
        $b.scrollTop(10);
        var t = $b.scrollTop();
        if (t < 5) $this.outerHeight($this.outerHeight() - t);
        $b.scrollTop(raw);
        return $this;
    };

    $.fn.AutosizeBottom = function () {
        if ($.browser.isLandray) return; //嵌入e9时不执行

        var $this = $(this);
        var platform = $this.attr('autosize-platform');
        var isPhone = $.browser.isPhone;
        if ((platform == 'phone' && !isPhone) || (platform == 'pc' && isPhone)) return;

        var val = $this.attr('autosize-bottom');
        if (!val) return;

        if (val === '#') {
            val = getFootHeight();
        }
        else {
            if (val.indexOf('###') >= 0) {
                var footHeight = getFootHeight().toString();
                val = val.replace(/###/g, footHeight);
            }
            val = parseFloat(eval(val));
        }

        var curH = innerHeight - $this.offset().top - val;
        var $parent = $this.parent();
        if ($parent.length > 0 && $parent[0] != document) curH -= $parent.scrollTop() || 0;
        var minHeight = $this.attr('autosize-minheight');
        if (!minHeight) {
            if ($this.attr('ctrtype') == "itabs")
                minHeight = 150;
            else
                minHeight = 100;
        }
        if (curH < minHeight) curH = minHeight;
        $this.outerHeight(curH).FitParentHeight().iCtrSetHeight();
        //--------------
        function getFootHeight() {
            var val = 0;
            var $footer = $('.pageFooter');
            if ($footer.length === 1) {
                val += $footer.outerHeight() + 8;
            }
            val += parseFloat($('body').css('margin-bottom')) || 0;
            return val;
        }
    };

    $.fn.zoomClose = function (speed, _callback) {
        $ctr = $(this);
        if ($ctr.length === 0) return $ctr;
        if ($ctr.length > 1) {
            $ctr.each(function () { $(this).zoomClose(speed, _callback); });
            return $ctr;
        }
        if (speed && speed.constructor === Function) {
            _callback = speed;
            speed = null;
        }
        speed = speed || 200;
        $ctr.css({ 'transition': 'transform ' + speed + 'ms ease-in', 'transform': 'scale(0.001,0.001)' })
        setTimeout(function () {
            $ctr.clearIframe().remove();
            if (_callback) _callback();
        }, speed);
    };

    $.fn.zoomOpen = function (options, _callback) {
        $ctr = $(this);
        if ($ctr.length !== 1) return;

        if ($ctr.parent().length == 0) $('body').append($ctr);

        var $parent, top, left, speed;

        if (options && options.constructor === Function) {
            _callback = options;
            options = null;
        }
        if (options) {
            $parent = options.$parent;
            top = options.top || false;
            left = options.left || false;
            speed = options.speed;
        }
        speed = speed || 200;
        $parent = $parent || $('body');

        $ctr.css({ 'transform': 'scale(0.01,0.01)', 'visibility': 'hidden', 'top': '0px', 'left': '0px' });
        if ($parent !== 'none')
            $parent.append($ctr);
        else
            $parent = $ctr.parent();

        setTimeout(function () {
            var ctrheight = $ctr.outerHeight();
            var ctrwidth = $ctr.outerWidth();
            if (!top && top !== 0) {
                var allheight = $parent[0].ownerDocument.documentElement.clientHeight;
                top = (allheight - ctrheight) / 2 - 15;
            }
            if (!left && left !== 0) {
                var allwidth = $parent[0].ownerDocument.documentElement.clientWidth;
                left = (allwidth - ctrwidth) / 2;
            }

            $ctr.css({ 'top': top + 'px', 'left': left + 'px', 'visibility': 'visible', 'transition': 'transform ' + speed + 'ms ease-in', 'transform': 'none' });
            setTimeout(function () {
                if (_callback) _callback();
            }, speed);

        }, 0);
        return $ctr;
    };

    $.fn.ProgressBar = function (percent, isBottom) {
        var $wrap = $(this);
        var $pbar = $wrap.find('.ProgressBar');

        if (percent === false) {
            $pbar.remove();
            return;
        }
        if (!percent || percent === '0') percent = '0%';
        if (percent === 1 || percent === '1') percent = '100%';
        if (percent === '0%' || percent === '100%') {
            $pbar.css('width', percent);
            setTimeout(function () { $pbar.remove(); }, 500);
            return;
        }
        if ($pbar.length === 0) {
            $pbar = $('<div class="ProgressBar"></div>')
            $wrap.append($pbar);
        }
        if (isBottom)
            $pbar.css('bottom', '0px');
        else
            $pbar.css('top', '0px');

        if (percent.toString().indexOf('%') < 0) {
            if (parseFloat(percent) > 1)
                percent += '%';
            else
                percent = (parseFloat(percent) * 100) + '%';
        }

        $pbar.css('width', percent);
    };

    $.fn.iGroupToggle = function (state) {
        var $wrap = $(this);
        if ($wrap.length === 0) return $wrap;
        if ($wrap.length > 1) {
            $wrap.each(function () { $(this).iGroupToggle(state); });
            return $wrap;
        }

        if (!($wrap.hasClass('iGroup') || $wrap.hasClass('iPanel') || $wrap.hasClass('ibpm') || $wrap.hasClass('itabs-wrap'))) {
            $wrap.find('.iGroup,.iPanel,.ibpm,.itabs-wrap').iGroupToggle(state);
            return $wrap;
        }

        if ($wrap.attr('istoggling')) return $wrap;
        $wrap.attr('istoggling', 'true');

        var $icon = $wrap.find('>span>.icon-button,>.ibpm-title>.righticon,>.panels>span>.xiconfont');
        var $content = $wrap.find('>div.iGroup-Content, >div.iPanel-Content, >div.ibpm-list');

        var resizectr = $wrap.attr('resizectr');
        var hasRela = false;
        if (resizectr) {
            var $resizectr = $(resizectr);
            var resizectrlen = $resizectr.length;
            if (resizectrlen > 0) {
                hasRela = true;
                $resizectr.attr('_rawheight4resize', $resizectr.outerHeight());
                var h2 = $wrap.outerHeight();
            }
        }

        if ($icon.hasClass('xicon-menuup1')) {//hide
            if (state === 'show') {
                $wrap.removeAttr('istoggling');
                return $wrap;
            }
            $icon.toggleClass('fa-rotate-180');
            if ($wrap.hasClass('itabs-wrap')) {
                $wrap.attr('_rawoverflow', $wrap.css('overlfow')).css('overflow', 'hidden');
                $wrap.attr('_ratoggleheight', $wrap.outerHeight());
                $wrap.animate({ height: '26px' }, {
                    progress: function () { slideProgress(); },
                    complete: function () {
                        setTimeout(function () {
                            $wrap.removeAttr('istoggling');
                            $(window).resize();
                        }, 100);
                    }
                });
            }
            else {
                $content.slideToggle({
                    progress: function () { slideProgress(); },
                    complete: function () {
                        setTimeout(function () {
                            $wrap.removeAttr('istoggling');
                            $(window).resize();
                            $wrap.iCtrSetHeight();
                        }, 100);
                    }
                });
                $wrap.addClass('autoheight');
            }
        }
        else if ($icon.hasClass('xicon-menudown1')) { //show
            if (state === 'hide') {
                $wrap.removeAttr('istoggling');
                return $wrap;
            }
            $icon.toggleClass('fa-rotate-180');
            var mutexctr = $wrap.attr('mutexctr');
            if (mutexctr) $(mutexctr).iGroupToggle('hide');
            if ($wrap.hasClass('itabs-wrap')) {
                $wrap.animate({ height: $wrap.attr('_ratoggleheight') + 'px' }, {
                    progress: function () { slideProgress(); },
                    complete: function () {
                        $wrap.css('overflow', $wrap.attr('_rawoverflow'));
                        if (($wrap.attr('_isExpanded') || "false") == "false") {
                            $.each(ictr._rundata_.igroupExpand, function () { this($wrap); });
                            $wrap.attr('_isExpanded', 'true');
                        }
                        setTimeout(function () {
                            $wrap.removeAttr('istoggling');
                            $(window).resize();
                            $wrap.iCtrSetHeight();
                        }, 100);
                    }
                });
            }
            else {
                $content.slideToggle({
                    progress: function () { slideProgress(); },
                    complete: function () {
                        if (($wrap.attr('_isExpanded') || "false") == "false") {
                            $.each(ictr._rundata_.igroupExpand, function () { this($wrap); });
                            $wrap.attr('_isExpanded', 'true');
                        }
                        setTimeout(function () {
                            $wrap.removeAttr('istoggling');
                            $(window).resize();
                            $wrap.iCtrSetHeight();
                        }, 100);
                    }
                });
            }
            $(window).resize();
            $wrap.iCtrSetHeight();
        }
        return $wrap;

        function slideProgress() {
            var h = $wrap.outerHeight();
            $.each(ictr._rundata_.igroupToggle, function () { this($wrap, h2, h); });
            if (hasRela) {
                $resizectr.each(function () {
                    var $rctr = $(this);
                    var h1 = parseFloat($rctr.attr('_rawheight4resize'));
                    $resizectr.outerHeight(h1 + (h2 - h) / resizectrlen).iCtrSetHeight();
                    $(window).resize();
                })
            }
            $(window).resize();
        }
    };

    $.fn.iStage = function (data) {

        //var data = [
        //    {
        //        title: '第一阶段',
        //        bgt: '2019-1-1',
        //        act: '2019-1-2'
        //    },
        //    {
        //        title: '第二阶段',
        //        bgt: '2019-3-1',
        //        act: '2019-3-2'
        //    },
        //    {
        //        title: '第三阶段',
        //        bgt: '2019-4-1',
        //        act: '2019-4-2'
        //    }
        //];

        var $wrap = $(this);

        var percent = $wrap.attr('percent') || 0;
        var stage = $wrap.attr('stage') || 0;

        var showPlan = $wrap.attr('showplan') == 'true' ? true : false;
        var showAct = $wrap.attr('showact') == 'true' ? true : false;

        if (data) $wrap.attr('data', $.toJsonString(data));
        data = $wrap.attr('data') || '';
        data = $.JsonObject(data);

        if (!data || data.constructor !== Array) {
            return $wrap.html('');
        }

        var htmt = '<div class="row title">';
        var htmp = '<div class="row point" style="position:relative;">';
        var htmb = '<div class="row title bgt">';
        var htma = '<div class="row title act">';

        var total = data.length;
        var cwidth = 'style="width:' + (1 / total * 100) + '%;"';
        if (stage > total - 1) stage = total - 1;

        percent = parseFloat(percent);
        if (percent < 1) percent *= 100;

        if (percent / 100 < stage / (total - 1)) percent = stage / (total - 1) * 100;
        if (percent / 100 > (stage + 1) / (total - 1) - 0.05) percent = (stage + 1) / (total - 1) * 100 - 5;

        $.each(data, function (i, val) {
            htmt += '<div ' + cwidth + '>' + EncodeHtml(val.title) + '</div>';

            var dotcss = '';
            if (i <= stage) {
                dotcss = 'over';
                if (i == stage && stage < total - 1) dotcss += ' active';
            }
            htmp += '<div ' + cwidth + ' class="' + dotcss + '"><div class="dot"></div></div>';

            htmb += '<div ' + cwidth + '>' + EncodeHtml(val.bgt) + '</div>';
            htma += '<div ' + cwidth + '>' + EncodeHtml(val.act) + '</div>';
        });

        htmt += '</div>';

        var pp = $.browser.msie ? (percent + '%') : ('calc(' + percent + '% + 8px)');

        htmp += '<span class="progress" style="width:' + ((total - 1) / total * 100) + '%; left:' + (1 / total / 2 * 100) + '%;"><span style="width:' + pp + ';"></span></span></div>';
        htmb += '</div>';
        htma += '</div>';
        var h = htmt + htmp;
        if (showPlan) h += htmb;
        if (showAct) h += htma;

        return $wrap.attr('percent', percent).attr('stage', stage).html(h);
    };

    $.fn.insertPagebreak = function () {
        var $this = $(this);
        if ($this.length === 0) return $this;
        $('<div style="page-break-after:always; display:block !important; border:0px; height:0px; width:0px;"></div>').insertBefore($this);
    }

    $.fn.clearIframe = function () {
        var $this = $(this);
        if ($this.length == 0) return $this;
        var $el = $this;
        if ($el[0].tagName != "IFRAME") $el = $el.find('iframe');
        if ($el.length == 0) return $this;

        $el.each(function () {
            var $frm = $(this);
            $frm.attr('src', 'about:blank');
            try {
                var iframe = $frm[0].contentWindow
                iframe.document.write('');
                iframe.document.clear();
            } catch (e) { };
        });
        return $this;
    };

})(jQuery);

/**-- $.xxx ----------------------------*/
(function ($) {

    $.JsonObject = function (JsonString, trimQuote) {
        var $this = {};
        if (JsonString === null || JsonString === undefined) return $this;
        if (JsonString === 0 || JsonString === false || JsonString === '') return JsonString;
        if (JsonString) {
            if (JsonString.constructor === String) {
                var JsonStrTmp = $.trim(JsonString);
                if (JsonStrTmp) {
                    if (trimQuote) JsonStrTmp = $.trimQuote(JsonStrTmp);
                    var JsonStrLen = JsonStrTmp.length;
                    if (JsonStrTmp.charAt(0) === '{' && JsonStrTmp.charAt(JsonStrLen - 1) === '}' || JsonStrTmp.charAt(0) === '[' && JsonStrTmp.charAt(JsonStrLen - 1) === ']') {
                        try {
                            $this = (new Function("return " + JsonStrTmp))();
                        }
                        catch (ex) {
                            console.error(ex + "\r\n---------------\r\n" + JsonStrTmp);
                            $this = JsonString;
                        }
                    }
                    else $this = JsonString;
                }
                else return JsonString;
            }
            else $this = JsonString;
        }
        return $this;
    };

    $.trimQuote = function (str) {
        if (!str || str.constructor !== String) return str;

        var JsonStrTmp = $.trim(str);
        var JsonStrLen = JsonStrTmp.length;
        if (!JsonStrTmp && JsonStrLen < 3) return str;

        if (JsonStrTmp.charAt(0) === '"' && JsonStrTmp.charAt(JsonStrLen - 1) === '"') {
            var reg = /\\[rntbf|\\|\"]/g;
            return JsonStrTmp.replace(reg, function (s) {
                switch (s) {
                    case "\\r": return "\r";
                    case "\\n": return "\n";
                    case "\\t": return "\t";
                    case "\\b": return "\b";
                    case "\\f": return "\f";
                    case "\\\\": return "\\";
                    case "\\\"": return "\"";
                }
                return s;
            });
        }
        else if (JsonStrTmp.charAt(0) === "'" && JsonStrTmp.charAt(JsonStrLen - 1) === "'") {
            var reg = /\\[rntbf|\\|\']/g;
            return JsonStrTmp.replace(reg, function (s) {
                switch (s) {
                    case "\\r": return "\r";
                    case "\\n": return "\n";
                    case "\\t": return "\t";
                    case "\\b": return "\b";
                    case "\\f": return "\f";
                    case "\\\\": return "\\";
                    case "\\'": return "'";
                }
                return s;
            });
        }
        return str;
    };

    $.trimEndZero = function (s) {
        if (s == 0) return "0";
        if (!s) return '';
        s = $.toJsonString($.optimizeNumber(s));

        if (s.indexOf('.') > -1) {
            s = $.trimEnd($.trimEnd(s, '0'), '.');
        }
        else {
            s = $.trim(s);
        }

        if (s && s.charAt(0) == ".") {
            s = "0" + s;
        }
        return s;
    };

    $.trimEnd = function (str, c) {
        if (!str) return '';
        str = $.trim(str);
        if (!c) {
            var rg = /\s/;
            var i = str.length;
            while (rg.test(str.charAt(--i)));
            return str.slice(0, i + 1);
        }
        else {
            var i = str.length;
            while (c == str.charAt(--i));
            return str.slice(0, i + 1);
        }
    };

    $.toJsonString = function (obj, Keys) {
        if (obj === null || obj === undefined || obj === '') return '';
        if (obj === 0) return '0';
        if (obj === false) return 'false';
        if (obj === true) return 'true';
        if (obj.constructor === Number && isNaN(obj)) return '';

        if (!obj || obj.constructor === String) {
            return obj;
        }
        else {
            if (!Keys) return JSON.stringify(obj);
            var jo = {};
            var ks = Keys.split(',');
            for (var i = 0; i < ks.length; i++) {
                key = $.trim(ks[i]);
                if (key in obj) jo[key] = obj[key];
            }
            return JSON.stringify(jo);
        }
    };

    $.isPrintPreview = function () { return window.frameElement && window.frameElement.attributes['isprintpreview'] ? true : false };

    $.browser = {
        getBrowser: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf(" edge/") > 0) return "edge";
            else if (ua.indexOf(" firefox/") > 0) return "firefox";
            else if (ua.indexOf(" trident/") > 0) return "msie";
            else if (ua.indexOf(" chrome/") > 0) return "chrome";
            else if (ua.indexOf(" safari/") > 0 || ua.indexOf("m9-app(ios)") > 0) return "safari";
            return "";
        },
        get edge() { return this.getBrowser() === 'edge' ? true : false; },
        get firefox() { return this.getBrowser() === 'firefox' ? true : false; },
        get msie() { return this.getBrowser() === 'msie' ? true : false; },
        get chrome() { return this.getBrowser() === 'chrome' ? true : false; },
        get safari() { return this.getBrowser() === 'safari' ? true : false; },
        get ios() {
            var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
            var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
            return /iphone|ipad|ipod|ios/.test(navigator.userAgent.toLowerCase()) || (weexPlatform === 'ios');
        },
        get android() {
            var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
            var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
            return (navigator.userAgent.toLowerCase().indexOf('android') > 0) || (weexPlatform === 'android');
        },
        get ipad() { return /ipad/i.test(navigator.userAgent.toLowerCase()) },
        get iphone() { return navigator.userAgent.indexOf("iPhone") > -1 },
        get isPhone() {
            if (typeof WXEnvironment !== 'undefined') return true;
            var ua = navigator.userAgent.toLowerCase();
            var keywords = ["ipad", "ipod", "iphone os", "midp", "rv:1.2.3.4", "ucweb", "android", "windows phone", "windows mobile", "windows ce", "mqqbrowser"];
            if (ua.indexOf('windows nt') >= 0 || ua.indexOf('macintosh') >= 0) return false;
            for (var i = 0; i < keywords.length; i++) {
                if (ua.indexOf(keywords[i]) >= 0) return true;
            }
            return false;
        },
        get isApp() { return navigator.userAgent.indexOf("m9-App") > 0 },
        get isWx() {
            return navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger"
                || navigator.userAgent.toLowerCase().match(/WxWork/i) == "wxwork"
                || navigator.userAgent.toLowerCase().match(/wechatdevtools/i) == "wechatdevtools"
        },
        get isLandray() {
            return window.frameElement && window.frameElement.id === 'external-frame' && window.frameElement.baseURI.indexOf('https://e9.simon.com.cn/') === 0;
        }
    };

    $.FormatNumber = function (v, m) {
        if (m === 0)
            m = '#,##0';
        else if (m === -1 || m === "-1")
            m = "#,##0.############";
        v = $.toNumber(v);

        if (!m || isNaN(+v)) return v;

        if (m.constructor == Number || m !== '0' && /^\d+$/.test(m + '')) m = "n" + m;

        //prefix and suffix
        var prefix = '';
        var suffix = '';
        if (/^[PpNnFfDd]\d*$/.test(m) == false) {
            for (var i = 0; i < m.length; i++) {
                if (m.charAt(i).match(/[^0#\-\+\.\,\%‰]/g))
                    prefix += m.charAt(i);
                else
                    break;
            }
            if (prefix) m = m.substr(prefix.length);
            if (m) {
                for (var i = m.length - 1; i >= 0; i--) {
                    if (m.charAt(i).match(/[^0#\-\+\.\,\%‰]/g))
                        suffix = m.charAt(i) + suffix;
                    else
                        break;
                }
                if (suffix) m = m.substr(0, m.length - suffix.length);
            }
        }
        if (!m) m = '0.############';

        //N2 F2 P2 D2
        var m1 = m.charAt(0).toLocaleLowerCase();
        if (m1 == "n" || m1 == "f" || m1 == "p") {
            var decimalLen = m.length == 1 ? 2 : parseInt(m.substr(1));
            m = (m1 == "n" || m1 == "p") ? "#,##0" : "0";
            if (decimalLen > 0) {
                m += ".";
                for (var rep = 0; rep < decimalLen; rep++) m += "0";
            }
            if (m1 == "p") m += "%";
        }
        else if (m1 == "d") {
            var decimalLen = m.length == 1 ? 1 : parseInt(m.substr(1));
            m = '';
            if (decimalLen == 0) decimalLen = 1;
            for (var rep = 0; rep < decimalLen; rep++) m += "0";
        }

        //convert any string to number according to formation sign.
        var v = m.charAt(0) == '-' ? -v : +v;
        var isNegative = v < 0 ? v = -v : 0; //process only abs(), and turn on flag.

        //percent
        var percent = m.charAt(m.length - 1);
        if (percent === '%' || percent === '‰') {
            m = m.substr(0, m.length - 1);
            v *= (percent == '%' ? 100 : 1000);
        }
        else
            percent = '';

        //search for separator for grp & decimal, anything not digit, not +/- sign, not #.
        var result = m.match(/[^0#\-\+]/g);
        var Decimal = (result && result[result.length - 1]) || '.'; //treat the right most symbol as decimal 
        var Group = (result && result[1] && result[0]) || ',';  //treat the left most symbol as group separator
        if (Decimal == Group) Decimal = '.';

        //split the decimal for the format string if any.
        var m = m.split(Decimal);
        //Fix the decimal first, toFixed will auto fill trailing zero.
        v = v.toFixed(m[1] && m[1].length);
        v = +(v) + ''; //convert number to string to trim off *all* trailing decimal zero(es)

        //fill back any trailing zero according to format
        var pos_trail_zero = m[1] && m[1].lastIndexOf('0'); //look for last zero in format
        var part = v.split('.');
        //integer will get !part[1]
        if (!part[1] || part[1] && part[1].length <= pos_trail_zero) {
            v = (+v).toFixed(pos_trail_zero + 1);
        }
        var szSep = m[0].split(Group); //look for separator
        m[0] = szSep.join(''); //join back without separator for counting the pos of any leading 0.

        var pos_lead_zero = m[0] && m[0].indexOf('0');
        if (pos_lead_zero > -1) {
            while (part[0].length < (m[0].length - pos_lead_zero)) {
                part[0] = '0' + part[0];
            }
        }
        else if (+part[0] == 0) {
            part[0] = '';
        }

        v = v.split('.');
        v[0] = part[0];

        //process the first group separator from decimal (.) only, the rest ignore.
        //get the length of the last slice of split result.
        var pos_separator = (szSep[1] && szSep[szSep.length - 1].length);
        if (pos_separator) {
            var integer = v[0];
            var str = '';
            var offset = integer.length % pos_separator;
            for (var i = 0, l = integer.length; i < l; i++) {

                str += integer.charAt(i); //ie6 only support charAt for sz.
                //-pos_separator so that won't trail separator on full length
                if (!((i - offset + 1) % pos_separator) && i < l - pos_separator) {
                    str += Group;
                }
            }
            v[0] = str;
        }

        v[1] = (m[1] && v[1]) ? Decimal + v[1] : "";
        return prefix + (isNegative ? '-' : '') + v[0] + v[1] + percent + suffix;
    };

    $.PadLeft = function (number, len) {
        number = '0000000000' + (number || '0');
        len = len || 2;
        return number.substr(number.length - len)
    }

    $.optimizeNumber = function (number) {
        return parseFloat(parseFloat(number).toPrecision(12));
    };

    $.optimizeWhiteSpace = function (str) {
        return (str || '').replace(/\u00A0/g, ' ').replace(/\u2006/g, ' ');
    }

    $.formatDate = function (dateObj, formatString) {
        if (dateObj === 'today') return $.formatDate(new Date(), "yyyy-MM-dd");
        if (dateObj === 'now') return $.formatDate(new Date(), "yyyy-MM-dd HH:mm:ss");
        if (dateObj === 'minute') return $.formatDate(new Date(), "yyyy-MM-dd HH:mm");
        if (dateObj === 'period') return $.formatDate(new Date(), "yyyy-MM");

        if (!dateObj) return '';
        if (!formatString) formatString = 'yyyy-M-d';
        var o = {
            "M+": dateObj.getMonth() + 1, //month   
            "d+": dateObj.getDate(), //day   
            "h+": dateObj.getHours(), //hour   
            "H+": dateObj.getHours(), //hour   
            "m+": dateObj.getMinutes(), //minute   
            "s+": dateObj.getSeconds(), //second   
            "q+": Math.floor((dateObj.getMonth() + 3) / 3), //quarter   
            "S": dateObj.getMilliseconds() //millisecond   
        };
        if (/(y+)/.test(formatString)) formatString = formatString.replace(RegExp.$1, (dateObj.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(formatString)) {
                formatString = formatString.replace(RegExp.$1,
                    RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return formatString;
    };

    $.GetDateDiff = function (datetime1, datetime2, diffType) {

        if (!datetime1) datetime1 = new Date();
        if (!datetime2) datetime2 = new Date();

        if (datetime1.constructor == String) {
            datetime1 = datetime1.replace(/\-/g, "/");
        }
        if (datetime2.constructor == String) {
            datetime2 = datetime2.replace(/\-/g, "/");
        }

        //将计算间隔类性字符转换为小写
        diffType = $.trim(diffType.toLowerCase());

        var sTime = new Date(datetime1);  //开始时间
        var eTime = new Date(datetime2);  //结束时间
        //作为除数的数字
        var divNum = 1;
        switch (diffType) {
            case "second":
            case "s":
                divNum = 1000;
                break;
            case "minute":
            case "m":
                divNum = 1000 * 60;
                break;
            case "hour":
            case "h":
                divNum = 1000 * 3600;
                break;
            case "day":
            case "d":
                divNum = 1000 * 3600 * 24;
                break;
            default:
                break;
        }
        return parseFloat((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
    };

    $.AddDays = function (days, date) {
        if (!date) date = new Date();
        date.setMilliseconds(date.getMilliseconds() + (days * 24 * 60 * 60 * 1000));
        return date;
    };

    $.AddHours = function (hours, date) {
        if (!date) date = new Date();
        date.setMilliseconds(date.getMilliseconds() + (hours * 60 * 60 * 1000));
        return date;
    };

    $.AddMinutes = function (minutes, date) {
        if (!date) date = new Date();
        date.setMilliseconds(date.getMilliseconds() + (minutes * 60 * 1000));
        return date;
    };

    $.toNumber = function (obj, isInt) {
        if (!obj) return 0;
        var isPercent = false;
        if (obj.constructor === String) {
            obj = $.trim(obj.replace(/,/g, ''));
            if (obj.indexOf('%') == obj.length - 1) {
                obj = obj.replace('%', '');
                isPercent = true;
            }
        }
        obj = Number(obj) || 0;
        if (isPercent) obj /= 100;
        if (isInt) obj = Math.round(obj);
        return parseFloat(parseFloat(obj).toPrecision(12));
    };

    $.isTrue = function (val) {
        if (!val) return false;
        val = $.trim(val.toString().toLowerCase().replace('&nbsp;', ''));
        if (!val) return false;
        if (val === 'false' || val === 'no' || val === 'n' || val === 'undefined' || val === 'null'
            || val === '否' || val === '无' || val === '×' || val === 'x')
            return false;
        return true;
    };

    $.toList = function (str, separator, trimQuote) {
        if (!str) return [];
        if (!separator) separator = ',';

        var ss = str.toString().split(separator);
        var ret = [];
        for (var i = 0; i < ss.length; i++) {
            var s = $.trim(ss[i]);
            if (s) {
                if (trimQuote && s.length > 2
                    && (s.substr(0, 1) == "'" && s.substr(s.length - 1) == "'")
                    || (s.substr(0, 1) == '"' && s.substr(s.length - 1) == '"')
                ) {
                    s = s.substr(1, s.length - 2);
                }
                ret.push(s);
            }
        }
        return ret;
    };

    $.toListStr = function (obj, isSQL) {
        if (!obj) return isSQL ? "'-999999'" : "";

        if (obj.constructor != Array) obj = $.toList(obj, ',', true);
        var ret = '';
        for (var i = 0; i < obj.length; i++) {
            var s = $.trim(obj[i].toString());
            if (s) {
                if (isSQL) s = "'" + s.replace(/'/g, "''") + "'";
                ret += s + ',';
            }
        }
        ret = ret.substr(0, ret.length - 1);
        if (!ret) return isSQL ? "'-999999'" : "";
        return ret;
    };

    $.compressImage = function (img, pixs) {
        if (!pixs) pixs = 800 * 600;
        var width = img.width;
        var height = img.height;
        //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
        var ratio = width * height / pixs;
        if (ratio > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            height /= ratio;
        }
        var ori = $.ImgOrientation(img); //旋转
        if (ratio <= 1 && ori != 6 && ori != 8 && ori != 3) {
            return img.src;
        }

        //用于压缩图片的canvas
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#fff";

        if (ori === 6) //需要顺时针（向左）90度旋转
        {
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(90 * Math.PI / 180);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, -height, width, height);
        } else if (ori === 8) //需要逆时针（向右）90度旋转
        {
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(270 * Math.PI / 180);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, -width, 0, width, height);
        } else if (ori === 3) //需要180度旋转
        {
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(270 * Math.PI / 180);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, -width, -height, width, height);
        } else {
            canvas.width = width;
            canvas.height = height;
            ctx.fillRect(0, 0, canvas.width, canvas.height); //铺底色
            ctx.drawImage(img, 0, 0, width, height);
        }
        //进行压缩
        var ndata = canvas.toDataURL('image/jpeg', 0.8);
        ctx = null;
        canvas = null;
        return ndata;
    };

    $.ImgOrientation = function (img) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;
        if (!img.exifdata) getImageData(img);
        return img.exifdata['Orientation'];

        function getImageData(img) {
            function handleBinaryFile(binFile) {
                var data = findEXIFinJPEG(binFile);
                img.exifdata = data || {};
            }
            if (img.src) {
                if (/^data\:/i.test(img.src)) { // Data URI
                    var arrayBuffer = base64ToArrayBuffer(img.src);
                    handleBinaryFile(arrayBuffer);
                } else if (/^blob\:/i.test(img.src)) { // Object URL
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        handleBinaryFile(e.target.result);
                    };
                    objectURLToBlob(img.src, function (blob) {
                        fileReader.readAsArrayBuffer(blob);
                    });
                } else {
                    var http = new XMLHttpRequest();
                    http.onload = function () {
                        if (this.status == 200 || this.status === 0) {
                            handleBinaryFile(http.response);
                        } else {
                            throw "Could not load image";
                        }
                        http = null;
                    };
                    http.open("GET", img.src, true);
                    http.responseType = "arraybuffer";
                    http.send(null);
                }
            } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    handleBinaryFile(e.target.result);
                };
                fileReader.readAsArrayBuffer(img);
            }
        }

        function base64ToArrayBuffer(base64, contentType) {
            contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            var binary = atob(base64);
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }
            return buffer;
        }

        function objectURLToBlob(url, callback) {
            var http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.responseType = "blob";
            http.onload = function (e) {
                if (this.status == 200 || this.status === 0) {
                    callback(this.response);
                }
            };
            http.send();
        }

        function findEXIFinJPEG(file) {
            var dataView = new DataView(file);
            if (dataView.getUint8(0) != 0xFF || dataView.getUint8(1) != 0xD8) return false; // not a valid jpeg

            var offset = 2,
                length = file.byteLength,
                marker;

            while (offset < length) {
                if (dataView.getUint8(offset) != 0xFF) return false; // not a valid marker, something is wrong
                marker = dataView.getUint8(offset + 1);
                if (marker == 225) return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);
                else offset += 2 + dataView.getUint16(offset + 2);
            }
        }

        function readTags(file, tiffStart, dirStart, bigEnd) {
            var entries = file.getUint16(dirStart, !bigEnd),
                tags = {},
                entryOffset, tag,
                i;

            for (i = 0; i < entries; i++) {
                entryOffset = dirStart + i * 12 + 2;
                if (file.getUint16(entryOffset, !bigEnd) == 0x0112) tags['Orientation'] = readTagValue(file, entryOffset, tiffStart, bigEnd);
            }
            return tags;
        }

        function readTagValue(file, entryOffset, tiffStart, bigEnd) {
            var numValues = file.getUint32(entryOffset + 4, !bigEnd),
                valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart,
                offset,
                vals, val, n;

            if (numValues === 1) {
                return file.getUint16(entryOffset + 8, !bigEnd);
            } else {
                offset = numValues > 2 ? valueOffset : entryOffset + 8;
                vals = [];
                for (n = 0; n < numValues; n++) {
                    vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
                }
                return vals;
            }
        }

        function getStringFromDB(buffer, start, length) {
            var outstr = "";
            for (n = start; n < start + length; n++) {
                outstr += String.fromCharCode(buffer.getUint8(n));
            }
            return outstr;
        }

        function readEXIFData(file, start) {
            if (getStringFromDB(file, start, 4) !== "Exif") return false;
            var bigEnd,
                tags, tag,
                exifData, gpsData,
                tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) === 0x4949) {
                bigEnd = false;
            } else if (file.getUint16(tiffOffset) === 0x4D4D) {
                bigEnd = true;
            } else {
                return false;
            }

            if (file.getUint16(tiffOffset + 2, !bigEnd) !== 0x002A) return false;
            var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);
            if (firstIFDOffset < 0x00000008) return false;
            tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, bigEnd);
            return tags;
        }
    };

    $.cookie = function (name, value) {
        if (arguments.length == 2) { // name and value given, set cookie 
            var expires = '';
            if (value === null) {
                value = '';
                expires = ";expires=Fri, 1 Dec 1990 23:59:59 GMT;";
            }
            else {
                expires = ";expires=Fri, 31 Dec 2999 23:59:59 GMT;";
            }
            document.cookie = [name, '=', encodeURIComponent(value), expires].join('');
        }
        else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = $.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };

    $.GetRemoteData = function (url, _callback) {
        var rettemp = '';
        $.ajax({
            async: _callback != null,
            type: "GET",
            url: url,
            cache: false,
            success: function (data) {
                if (_callback) _callback(data);
                rettemp = data;
            }
        });
        return rettemp;
    };

    $.SetRemoteData = function (url) {
        url += (url.indexOf("?") === -1 ? "?" : "&") + "temp=" + Math.random();
        new Image().src = url;
    };

    $.Copy = function (txt, isAlert) {
        if (window.clipboardData) {
            clipboardData.setData("text", txt);
            openAlert(lang("已经成功复制到剪切板！", "The text is on the clipboard, try to paste it!"));
        }
        else {
            var forExecElement = document.createElement("textarea");
            forExecElement.style.position = "fixed";
            forExecElement.style.left = "-10000px";
            forExecElement.style.top = "-10000px";
            forExecElement.value = txt;
            document.body.appendChild(forExecElement);
            forExecElement.select();
            var success = false;
            try {
                if (window.netscape && netscape.security) {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                success = document.execCommand("copy", false, null);
            }
            catch (ex) {
                success = false;
            }
            document.body.removeChild(forExecElement);
            if (isAlert !== false) {
                if (success) {
                    openAlert(lang("已经成功复制到剪切板！", "The text is on the clipboard, try to paste it!"));
                }
                else {
                    openAlert(lang("您的浏览器不允许剪贴板访问!", "Your browser doesn't allow clipboard access!"));
                }
            }
        }
    };

    $.JsonP = function (url, func) {

        if (!func) {
            $.SetRemoteData(url);
            return;
        }

        var name = '_jsonpfn' + (Math.random().toString().substr(2));
        url += (url.indexOf("?") === -1 ? "?" : "&") + 'callback=' + name;
        url += "&temp=" + Math.random();

        var script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.id = "srt_" + name;

        window[name] = function (json) {
            window[name] = undefined;
            var elem = document.getElementById("srt_" + name);
            if (elem && elem.parentNode) elem.parentNode.removeChild(elem);
            if (func) func(json);
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    $.LocalSvc = function (optType, args, callback) {
        openLoading();

        args = $.toJsonString(args);
        var maxlen = 1000;
        var i = 0;
        var len = args.length;
        var tempKey = "tempdata" + Math.random().toString().substr(2, 6);

        var _callback = function (jo) {
            if (callback) callback(jo);
            closeLoading();
        };

        //测试LocalSvc是否已启动
        window._isLocalSvcOK = false;
        var url = 'http://127.0.0.1:5799/?t=t';
        $.JsonP(url, function () {
            window._isLocalSvcOK = true;

            if (len <= maxlen) {
                var url = 'http://127.0.0.1:5799/?t=' + optType + '&d=' + encodeURIComponent(args);
                $.JsonP(url, _callback);
                return;
            }
            run();
        });
        setTimeout(function () {
            if (!window._isLocalSvcOK) {
                if (callback) callback(null);
                closeLoading();
                openAlert("本地服务未启动(LocalSvc not launched)");
            }
        }, 1000);

        function run() {
            var s = args.substr(i * maxlen, maxlen);
            var url1 = 'http://127.0.0.1:5799/?t=99&k=' + tempKey + '&v=' + encodeURIComponent(s);
            $.JsonP(url1, function () {
                i++;
                if (i * maxlen >= len) {
                    var url = 'http://127.0.0.1:5799/?t=' + optType + '&d=' + tempKey;
                    $.JsonP(url, _callback);
                    return;
                }
                else
                    run();
            });
        }
    };

    $.LocalSvcQuery = function (callback) {
        //测试LocalSvc是否已启动
        window._isLocalSvcOK = false;
        var url = 'http://127.0.0.1:5799/?t=t';
        $.JsonP(url, function (ret) {
            window._isLocalSvcOK = true;
            if (callback) callback(ret);
        });
        setTimeout(function () {
            if (!window._isLocalSvcOK) {
                openToast("本地服务未启动(LocalSvc has not launched)");
                if (callback) callback(false);
            }
        }, 1000);
    };

    $.WhenAjaxDone = function (callback, timeout) {
        if (!timeout && timeout !== 0) timeout = 100;
        setTimeout(function () {
            if (_miss_fun._hasAjaxRequest) {
                if (!ictr._rundata_.ajaxDoneCallback) ictr._rundata_.ajaxDoneCallback = [];
                ictr._rundata_.ajaxDoneCallback.push(callback);
            }
            else {
                callback();
            }
        }, timeout);
    };

    $.addCss = function (cssText, id) {
        if (!id) id = 'myStyle' + Math.random();
        var inStyle = document.createElement('style');
        inStyle.id = id;
        inStyle.type = 'text/css';
        inStyle.innerHTML = cssText
        document.getElementsByTagName('head')[0].appendChild(inStyle);
        return id;
    }
    $.addCssLink = function (cssSrc, id) {
        if (!id) id = 'myStyle' + Math.random();
        var inStyle = document.createElement('link');
        inStyle.id = id;
        inStyle.rel = 'stylesheet';
        inStyle.href = cssSrc;
        document.getElementsByTagName('head')[0].appendChild(inStyle);
        return id;
    }

    $.removeCss = function (id) {
        var elem = document.getElementById(id);
        if (elem && elem.parentNode) elem.parentNode.removeChild(elem);
    };

    // lazyload script
    // ref: http://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
    var _loadScript = function (p_url, p_params, p_callback) {

        var script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    p_callback();
                }
            };
        } else { //Others
            script.onload = function () { p_callback(); };
        }

        var scriptsProperties = ['type', 'src', 'htmlFor', 'event', 'charset', 'async', 'defer', 'crossOrigin', 'text', 'onerror'];

        if (typeof p_params === 'object' && !$.isEmptyObject(p_params)) {
            for (var key in p_params) {
                if (p_params.hasOwnProperty(key) && $.inArray(key, scriptsProperties)) {
                    script[key] = p_params[key];
                }
            }
        }

        document.getElementsByTagName(p_params['lazyLoad'] ? 'body' : 'head')[0].appendChild(script);
        script.src = p_url;
    };

    $.loadScript = function (url, params, callback) {

        // Handle p_params is exist
        if (arguments.length === 2 && typeof arguments[1] === 'function') {
            callback = arguments[1];
            params = {}
        }

        params = params || {};

        var _return = $.Deferred();

        // Call callback if necessary
        if (typeof (callback) === 'function') {
            _return.done(function () {
                callback();
            });
        }

        // Load javascript file
        _loadScript(url, params, function () {
            _return.resolve();
        });

        return _return.promise();
    };

})(jQuery);

/** web 端 iControls */
var ictr = {
    /**iPropertyGrid*/
    iPropertyGrid: function (id) {
        if (this.constructor !== ictr.iPropertyGrid) return new ictr.iPropertyGrid(id); //以new返回对象
        this.Title = '';
        this.id = id;
        this.Width = 170;
        this.Height = 0;
        this.Rounded = false;
        this.ReadOnly = false;
        this.DataSource = [];

        /*
        this.DataSource = [
            {title:"分组1",items:[ctr1,ctr2]},
            {title:"分组2",items:[ctr1,ctr2]}
        ];
        */

        this.GetHtml = function () {
            var Width1 = (this.Width - 15) / 2;
            var Width2 = this.Width - Width1 - 15;

            var strHtml = '<div class="propertyGrid">';

            strHtml += '<div class="dhead"><table>';
            strHtml += '<colgroup><col width="15"><col width="' + Width1 + '"><col width="' + Width2 + '"><col width="200"></colgroup>';
            strHtml += '<thead><tr><th></th><th>Name</th><th>Value</th><th></th></tr></thead>';
            strHtml += '</table></div>';

            strHtml += '<div class="dbody"><table>';
            strHtml += '<colgroup><col width="15"><col width="' + Width1 + '"><col width="' + Width2 + '"></colgroup>';

            for (var i = 0; i < this.DataSource.length; i++) {
                var grouptitle = this.DataSource[i].title || this.DataSource[i].Title;
                var items = this.DataSource[i].items || this.DataSource[i].Items;
                strHtml += '<tbody>';
                strHtml += '<tr><td class="rowhead" rowspan="' + (items.length + 1) + '"><img src="/images/Common/Tree/TreeLines/minus_small.gif" /></td>';
                strHtml += '<td class="grouphead" colspan="2">' + grouptitle + '</td></tr>';

                for (var j = 0; j < items.length; j++) {
                    var ctr = items[j];
                    ctr.Required = false;
                    ctr.Width = Width2 - 2;
                    ctr.style = 'float:left;';
                    strHtml += '<tr><td title="' + EncodeHtml(ctr.Title) + '">' + (ctr.Title) + '</td>';
                    //strHtml += '<td style="padding:0px;" ctr="' + EncodeHtml(JSON.stringify(ctr)) + '">' + ctr.GetValue() + '</td></tr>';
                    strHtml += '<td style="padding:0px;">' + ctr.GetHtml() + '</td></tr>';
                }
                strHtml += '</tbody>';
            }

            strHtml += '</table></div>';
            strHtml += '</div>';
            return strHtml;
        }
    },

    /**iText*/
    iText: function (id) {
        if (this.constructor !== ictr.iText) return new ictr.iText(id); //以new返回对象
        this.Title = '';
        this.id = id;
        this.CtrType = 'iText';
        this.Width = 170;
        this.Height = 0;
        this.Size = 'normal';
        this.IconType = 'none';
        this.IsShowRightIcon = true;
        this.Rounded = false;
        this.Required = false;
        this.ExtAttr = {};
        this.BindField = '';
        this.Disabled = false;
        this.Value = '';
        this.Placeholder = '';
        this.TextType = ictr.iTextType.String;
        this.ReadOnly = false;
        this.FormatStr = '';
        this.MinuteStep = 5;
        this.TextAlign = ictr.iTextAlign.auto;
        this.PercentMin = '';
        this.Lazy = false;
        this.style = '';
        this.AutosizeBottom = '';
        this.itips = null;

        this.GetValue = function () { return this.Value; };

        this.GetHtml = function () {
            if (!this.id) {
                if (this.BindField) {
                    this.id = this.BindField;
                } else {
                    this.id = "iText" + Math.random().toString().replace('-', '').replace('.', '');
                }
            } else {
                if (!this.BindField) this.BindField = this.id;
            }

            this.Width = (!this.Width || this.Width === 0 || this.Width === '0') ? "100%" : (this.Width + "px");

            var htmlHeight = this.TextType == 'TextArea' ? " style=\"height:" + this.Height + "px; line-height:" + this.Height + ";\"" : "";

            var paddingStyle = "";

            if (this.IconType && this.IconType !== 'none') {
                if (this.Size === 'normal') paddingStyle = "padding-left:21px;";
                else if (this.Size == 'large') paddingStyle = "padding-left:25px;";
                else paddingStyle = "padding-left:30px;";
            }
            if (this.IsShowRightIcon &&
                (this.TextType === 'Date' || this.TextType === 'DateTime' || this.TextType === 'Time' || this.TextType === 'Percent' ||
                    this.TextType === 'Decimal' || this.TextType === 'Integer' || this.TextType === 'Period')
            ) {
                if (this.Size === 'normal') paddingStyle += "padding-right:21px;";
                else if (this.Size === 'large') paddingStyle += "padding-right:25px;";
                else paddingStyle += "padding-right:30px;";
            }
            else if (this.IsShowRightIcon && this.TextType === 'Search') {
                if (this.Size === 'normal') paddingStyle += "padding-right:42px;";
                else if (this.Size === 'large') paddingStyle += "padding-right:50px;";
                else paddingStyle += "padding-right:60px;";
            }

            //textalign
            if (this.TextAlign === 'auto') {
                if (this.TextType === 'Decimal' || this.TextType === 'Percent' || this.TextType === 'Integer') this.TextAlign = 'right';
                else this.TextAlign = 'left';
            }

            var htmSize = this.Size === 'normal' ? "" : (" " + this.Size);
            var htmDisabled = this.Disabled ? " disabled" : "";
            var htmReadonly = this.ReadOnly ? " readonly" : "";
            var htmRightIcon = "";
            if (this.IsShowRightIcon) {
                if (this.TextType === 'Date') {
                    htmRightIcon = 'calendar';
                } else if (this.TextType === 'DateTime') {
                    htmRightIcon = 'calendar';
                } else if (this.TextType === 'Time') {
                    htmRightIcon = 'clock';
                } else if (this.TextType === 'Decimal' || this.TextType == 'Integer') {
                    htmRightIcon = 'number';
                } else if (this.TextType === 'Percent') {
                    htmRightIcon = 'percent';
                } else if (this.TextType === 'Period') {
                    htmRightIcon = 'period';
                } else if (this.TextType === 'Search') {
                    htmRightIcon = 'search';
                } else if (this.TextType === 'Scan') {
                    htmRightIcon = 'scan';
                }
            }

            var htmlRounded = this.Rounded ? " rounded" : "";

            var strHtml = "<div class=\"ictr-wrap" + (this.Required ? " required" : "") + htmlRounded + htmSize + "\" id=\"" + this.id + "\" ctrtype=\"iText\" ";
            if (this.itips) strHtml += " itips=\"" + EncodeHtml(this.itips) + "\"";
            strHtml += " texttype=\"" + this.TextType.toLowerCase() + "\"";

            strHtml += " isreadonly=\"" + (this.ReadOnly && this.Disabled ? "true" : "false") + "\"";
            strHtml += " isrequired=\"" + (this.Required ? "true" : "false") + "\"";
            strHtml += " bindfield=\"" + this.BindField + "\"";
            strHtml += " formatstr=\"" + EncodeHtml(this.FormatStr) + "\"";
            strHtml += " textalign=\"" + this.TextAlign + "\"";
            strHtml += " minutestep=\"" + this.MinuteStep + "\"";
            if (this.PercentMin && this.PercentMin != '0') strHtml += " percentmin=\"" + this.PercentMin + "\"";
            strHtml += " ExtAttr=\"" + EncodeHtml(JSON.stringify(this.ExtAttr)) + "\"";
            if (this.TextType == 'Editor' || this.TextType == 'TextArea') {
                if (this.AutosizeBottom) strHtml += " autosize-bottom=\"" + EncodeHtml(this.AutosizeBottom) + "\"";
                if ((!this.Height || this.Height === 0 || this.Height === '0'))
                    paddingStyle += "height:100%;";
                else
                    paddingStyle += "height:" + this.Height + "px;";
            }

            strHtml += " style=\"width:" + this.Width + ";" + paddingStyle + (this.style || "") + "\"";

            strHtml += ">";

            //left Icon
            if (this.IconType && this.IconType != 'none') {
                strHtml += "<span class=\"xiconfont lefticon xicon-" + this.IconType + "\"" + htmlHeight + "></span>";
            }
            //input
            if (this.TextType == 'Editor') {
                strHtml += "<div id=\"" + this.Id + "_Editor\" class=\"ieditorframe\"" + htmDisabled + ">" + this.Value + "</div>";
            } else if (this.TextType == 'TextArea') {
                strHtml += "<textarea id=\"" + this.id + "_text\" class=\"ictr-textarea\"" + htmDisabled + " placeholder=\"" + EncodeHtml(this.Placeholder) + "\" " + (this.Lazy || this.PercentMin && this.PercentMin != '0' ? "onchange" : "oninput") + "=\"_miss_fun.triggerAfterChange($(this).parent(), true);\">" + EncodeHtml(this.Value) + "</textarea>";
            } else {

                var inputType = "text";
                if (this.TextType === 'Password')
                    inputType = "password";
                var percentFun = "";
                if (this.TextType === 'Percent') {
                    percentFun = "_miss_fun.iTextValidatePercent(this);";
                }
                strHtml += "<input type=\"" + inputType + "\" id=\"" + this.id + "_text\" class=\"ictr-input\"" + htmReadonly + htmDisabled + " autocomplete =\"off\" placeholder=\"" + EncodeHtml(this.Placeholder) + "\" value=\"" + EncodeHtml(this.Value) + "\" " + (this.Lazy || this.PercentMin && this.PercentMin != '0' ? "onchange" : "oninput") + "=\"" + percentFun + "_miss_fun.triggerAfterChange($(this).parent(), true);\" />";
            }

            //right Icon
            if (this.TextType === 'Search') {
                strHtml += "<span class=\"xiconfont righticon xicon-more\" tabindex=\"99999\"" + htmDisabled + "" + htmlHeight + "></span>";
                if (this.Size === 'normal') htmlHeight = "margin-right:-21px;";
                else if (this.Size === 'large') htmlHeight = "margin-right:-25px;";
                else htmlHeight = "margin-right:-30px;";
            }
            if (htmRightIcon != "") {
                strHtml += "<span class=\"xiconfont righticon xicon-" + htmRightIcon + "\" tabindex=\"99999\"" + htmDisabled + "" + htmlHeight + "></span>";
            }
            strHtml += "</div>";

            return strHtml;
        };
    },

    /**iReference*/
    iReference: function (id) {
        if (this.constructor !== ictr.iReference) return new ictr.iReference(id); //以new返回对象
        this.Title = '';
        this.id = id;
        this.CtrType = 'iReference';
        this.Width = 170;
        this.Size = 'normal';
        this.Rounded = false;
        this.IconType = 'none';
        this.Placeholder = "";
        this.Required = false;
        this.ExtAttr = {};
        this.Disabled = false;
        this.BindField = '';
        this.Key = '';
        this.Code = '';
        this.Desc = '';
        this.Json = '';
        this.ShowType = 'code';
        this.EntityName = '';
        this.FieldsList = '';
        this.ExtDS = '';
        this.ExcludeKeys = '';
        this.FilterKeys = '';
        this.KeyField = '';
        this.DFilterValue = '';
        this.DFilterJson = '';
        this.DTableValue = '';
        this.CheckAuthority = false;
        this.AuthorityModule = '';
        this.ButtonDisabled = false;
        this.isSync = false;
        this.style = '';
        this.KeepBuffer = false;
        this.Url = '';
        this.UserValue = false;
        this.CanInput = true;
        this.MultiSelect = false;
        this.sql = '';
        this.oql = '';
        this.itips = null;

        this.GetValue = function () { return this.Key; };

        this.SetValue = function () {
            var Value = '',
                ValueType;
            if (this.Key || this.Key === 0) {
                Value = this.Key;
                ValueType = '#key#';
            } else if (this.Code || this.Code === 0) {
                Value = this.Code;
                ValueType = '#code#';
            } else {
                this.Key = '';
                this.Code = '';
                this.Desc = '';
                this.Json = '';
            }
            if (!Value || Value === 0) return;
            var thisobj = this;

            var filterjson = $.JsonObject(this.DFilterJson);
            if (!this.EntityName) {
                filterjson.Action = svr._currentAssembly;
                filterjson.CtrID = this.id;
            }

            var args = {
                ctrID: id,
                Value: Value, valueType: ValueType, EntityName: this.EntityName,
                KeyField: this.KeyField, DFilterValue: this.DFilterValue, DFilterJson: $.toJsonString(filterjson),
                Reference: getUrlArg("e"),
                DTableValue: this.DTableValue, CheckAuthority: this.CheckAuthority, AuthorityModule: this.AuthorityModule,
                FieldsList: this.FieldsList, extds: this.ExtDS,
                ExcludeKeys: this.ExcludeKeys, FilterKeys: this.FilterKeys
            };

            var jsonstr = $.iReferenceLoadData(args);
            if (jsonstr) {
                var jo = $.JsonObject(jsonstr);
                this.Key = jo.key || '';
                this.Code = jo.code || '';
                this.Desc = jo.desc || '';
                this.Json = jsonstr;
            }
        };

        this.GetHtml = function () {
            this.SetValue();
            if (!this.id) {
                if (this.BindField) {
                    this.id = this.BindField;
                } else {
                    this.id = "iRef" + Math.random().toString().replace('-', '').replace('.', '');
                }
            } else {
                if (!this.BindField) this.BindField = this.id;
            }

            this.Width = (!this.Width || this.Width === 0 || this.Width === '0') ? "100%" : (this.Width + "px");

            var paddingStyle = "";
            if (this.IconType && this.IconType !== 'none') {
                if (this.Size === 'normal') paddingStyle = "padding-left:21px;";
                else if (this.Size === 'large') paddingStyle = "padding-left:25px;";
                else paddingStyle = "padding-left:30px;";
            }
            if (this.Size === 'normal') paddingStyle += "padding-right:21px;";
            else if (this.Size === 'large') paddingStyle += "padding-right:25px;";
            else paddingStyle += "padding-right:30px;";

            var htmSize = this.Size === 'normal' ? "" : (" " + this.Size);
            var htmDisabled = this.Disabled ? " disabled" : "";

            var htmlRounded = this.Rounded ? " rounded" : "";
            var htmButtonDisabled = htmDisabled;
            if (!htmButtonDisabled && this.ButtonDisabled == true) htmButtonDisabled = " disabled";

            if (!htmDisabled && this.CanInput == false) htmDisabled = " readonly='readonly'";

            var strHtml = "<div class=\"ictr-wrap" + htmlRounded + htmSize + "\" id=\"" + this.id + "\" ctrtype=\"iReference\"";

            strHtml += " style=\"width:" + this.Width + ";" + paddingStyle + (this.style || "") + "\"";
            if (this.itips) strHtml += " itips=\"" + EncodeHtml(this.itips) + "\"";
            strHtml += " url=\"" + EncodeHtml(this.Url) + "\"";
            strHtml += " uservalue =\"" + (this.UserValue ? "true" : "false") + "\"";
            strHtml += " multiselect =\"" + (this.MultiSelect ? "true" : "false") + "\"";

            strHtml += " isrequired=\"" + (this.Required ? "true" : "false") + "\"";
            strHtml += " bindfield=\"" + this.BindField + "\"";
            strHtml += " isSync=\"" + (this.isSync ? "true" : "false") + "\"";
            strHtml += " key =\"" + EncodeHtml(this.Key) + "\"";
            strHtml += " code =\"" + EncodeHtml(this.Code) + "\"";
            strHtml += " desc =\"" + EncodeHtml(this.Desc) + "\"";
            strHtml += " json =\"" + EncodeHtml(this.Json) + "\"";
            strHtml += " showtype=\"" + this.ShowType + "\"";
            strHtml += " buttondisabled=\"" + (this.ButtonDisabled ? "true" : "false") + "\"";

            if (this.Code) {
                strHtml += " title=\"" + this.Code + "\r\n" + this.Desc + "\"";
            }

            strHtml += " entityname='" + EncodeHtml(this.EntityName) + "'";
            strHtml += " keyfield=\"" + EncodeHtml(this.KeyField) + "\"";
            strHtml += " dfiltervalue=\"" + EncodeHtml(this.DFilterValue) + "\"";
            strHtml += " dfilterjson=\"" + EncodeHtml(this.DFilterJson) + "\"";
            strHtml += " dtablevalue=\"" + EncodeHtml(this.DTableValue) + "\" ";
            strHtml += " checkauthority=\"" + (this.CheckAuthority ? "true" : "false") + "\"";
            strHtml += " fieldlist=\"" + EncodeHtml(this.FieldsList) + "\"";
            strHtml += " ExtAttr=\"" + EncodeHtml(JSON.stringify(this.ExtAttr)) + "\"";
            strHtml += " KeepBuffer=\"" + (this.KeepBuffer ? "true" : "false") + "\"";
            strHtml += " sql=\"" + EncodeHtml(this.sql) + "\"";
            strHtml += " oql=\"" + EncodeHtml(this.oql) + "\"";

            strHtml += " extds=\"" + EncodeHtml(this.ExtDS) + "\"";
            strHtml += " excludekeys=\"" + EncodeHtml(this.ExcludeKeys) + "\"";
            strHtml += " filterkeys=\"" + EncodeHtml(this.FilterKeys) + "\"";

            strHtml += ">";

            if (this.IconType != 'none') {
                strHtml += "<span class=\"xiconfont lefticon xicon-" + this.IconType + "\"></span>";
            }
            //input
            var showTxt = this.Code;
            if (this.ShowType == 'desc')
                showTxt = this.Desc;
            else if (this.ShowType == 'key')
                showTxt = this.Key;

            strHtml += "<input type=\"text\" class=\"ictr-input\"" + htmDisabled + " value=\"" + EncodeHtml(showTxt) + "\" autocomplete =\"off\" placeholder=\"" + this.Placeholder + "\" />";

            //右侧图标
            strHtml += "<span class=\"xiconfont righticon xicon-reference\" tabindex=\"99999\"" + htmButtonDisabled + "></span>";
            strHtml += "</div>";

            return strHtml;
        };
    },

    /**iSelect*/
    iSelect: function (id) {
        if (this.constructor !== ictr.iSelect) return new ictr.iSelect(id); //以new返回对象
        this.Title = '';
        this.id = id;
        this.CtrType = 'iSelect';
        this.Width = 170;
        this.Size = 'normal';
        this.Rounded = false;
        this.IconType = 'none';
        this.Placeholder = "";
        this.Required = false;
        this.ExtAttr = {};
        this.Disabled = false;
        this.ReadOnly = false;
        this.BindField = '';
        this.Value = '';
        this.MultiSelect = false;
        this.UserValue = false;
        this.EntityName = '';
        this.ClientDS = '';
        this.ExtDS = '';
        this.ExcludeKeys = '';
        this.FilterKeys = '';
        this.KeyField = '';
        this.DFilterValue = '';
        this.DFilterJson = '';
        this.DTableValue = '';
        this.CheckAuthority = true;
        this.AddEmpty = false;
        this.style = '';
        this.ShowAsList = false;
        this.ShowType = 'code';
        this.ShowCode = false;
        this.isSync = false;
        this.sql = '';
        this.oql = '';
        this.itips = null;

        this.GetValue = function () { return this.Value; };

        this.GetHtml = function () {
            if (!this.id) {
                if (this.BindField) {
                    this.id = this.BindField;
                } else {
                    this.id = "iSel" + Math.random().toString().replace('-', '').replace('.', '');
                }
            } else {
                if (!this.BindField) this.BindField = this.id;
            }

            this.Width = (!this.Width || this.Width === 0 || this.Width === '0') ? "100%" : (this.Width + "px");

            var paddingStyle = "";
            if (this.IconType && this.IconType !== 'none') {
                if (this.Size === 'normal') paddingStyle = "padding-left:21px;";
                else if (this.Size === 'large') paddingStyle = "padding-left:25px;";
                else paddingStyle = "padding-left:30px;";
            }
            if (!this.ShowAsList) {
                if (this.Size === "normal") paddingStyle += "padding-right:21px;";
                else if (this.Size === "large") paddingStyle += "padding-right:25px;";
                else paddingStyle += "padding-right:30px;";
            }
            var htmSize = this.Size === 'normal' ? "" : (" " + this.Size);
            var htmDisabled = this.Disabled ? " disabled" : "";
            var htmReadonly = this.ReadOnly ? " readonly" : "";

            var htmlRounded = this.Rounded ? " rounded" : "";
            var htmlHeight = this.ShowAsList ? " style=\"height:" + this.Height + "px; line-height:" + this.Height + "px;\"" : "";

            if (this.ClientDS && this.ClientDS.constructor === Array) this.ClientDS = $.toJsonString(this.ClientDS);

            var strHtml = "<div class=\"ictr-wrap" + htmlRounded + htmSize + (this.ShowAsList ? " childpicker-wrap iselect" : "")
                + "\" id=\"" + this.id + "\" ctrtype=\"iSelect\"";
            strHtml += " style=\"max-height:9999px;width:" + this.Width + ";" + paddingStyle + (this.style || "") + "\"";
            if (this.ShowAsList) strHtml += ";height:" + this.Height + "px;";
            strHtml += "\"";
            if (this.itips) strHtml += " itips=\"" + EncodeHtml(this.itips) + "\"";
            strHtml += " isrequired=\"" + (this.Required ? "true" : "false") + "\"";
            strHtml += " bindfield=\"" + this.BindField + "\"";
            strHtml += " value =\"" + EncodeHtml(this.Value) + "\"";
            strHtml += " readonly=\"" + (this.ReadOnly ? "true" : "false") + "\"";
            strHtml += " multiselect=\"" + (this.MultiSelect ? "true" : "false") + "\"";
            strHtml += " uservalue=\"" + (this.UserValue ? "true" : "false") + "\"";
            strHtml += " addempty=\"" + (this.AddEmpty ? "true" : "false") + "\"";
            strHtml += " showtype=\"" + (this.ShowType) + "\"";
            strHtml += " showcode=\"" + (this.ShowCode ? "true" : "false") + "\"";
            strHtml += " isSync=\"" + (this.isSync ? "true" : "false") + "\"";
            strHtml += " sql=\"" + EncodeHtml(this.sql) + "\"";
            strHtml += " oql=\"" + EncodeHtml(this.oql) + "\"";

            strHtml += " entityname =\"" + EncodeHtml(this.EntityName) + "\"";
            strHtml += " keyfield=\"" + EncodeHtml(this.KeyField) + "\"";
            strHtml += " dfiltervalue=\"" + EncodeHtml(this.DFilterValue) + "\"";
            strHtml += " dfilterjson=\"" + EncodeHtml(this.DFilterJson) + "\"";
            strHtml += " dtablevalue=\"" + EncodeHtml(this.DTableValue) + "\"";
            strHtml += " checkauthority=\"" + (this.CheckAuthority ? "true" : "false") + "\"";
            strHtml += " ds=\"" + EncodeHtml(this.ClientDS) + "\"";
            strHtml += " ExtAttr=\"" + EncodeHtml(JSON.stringify(this.ExtAttr)) + "\"";

            strHtml += " extds=\"" + EncodeHtml(this.ExtDS) + "\"";
            strHtml += " excludekeys=\"" + EncodeHtml(this.ExcludeKeys) + "\"";
            strHtml += " filterkeys=\"" + EncodeHtml(this.FilterKeys) + "\"";

            strHtml += ">";

            //left Icon
            if (this.IconType && this.IconType != 'none') {
                strHtml += "<span class=\"xiconfont lefticon xicon-" + this.IconType + "\"" + htmlHeight + "></span>";
            }

            if (!this.ShowAsList) {
                //input
                strHtml += "<input type=\"text\" id=\"" + this.id + "_text\" class=\"ictr-input\"" + htmReadonly + htmDisabled + " autocomplete =\"off\" placeholder=\"" + this.Placeholder + "\" />";

                //drowdown Icon
                strHtml += "<span class=\"xiconfont righticon fa-rotate-trans xicon-down\" tabindex=\"99999\"" + htmDisabled + "></span>";
                strHtml += "</div>";
            }
            else {
                //Show as List
                strHtml += "<div style=\"position:relative; float:left; width:100%; height:" + (this.Height - 2) + "px;\"></div>";
            }
            return strHtml;
        };
    },

    /**iSelectOptions*/
    iSelectOptions: function (ds) {
        if (this.constructor !== ictr.iSelectOptions) return new ictr.iSelectOptions(ds); //以new返回对象
        this._options = [];
        this.add = function (key, code, desc) {
            var sKey = "",
                sValue = "",
                sText = "";
            if (arguments.length === 1) {
                sKey = key;
                sValue = key;
                sText = key;
            } else if (arguments.length === 2) {
                sKey = key;
                sValue = key;
                sText = code;
            } else if (arguments.length === 3) {
                sKey = key;
                sValue = code;
                sText = desc;
            }
            this._options.push([sKey, sValue, sText]);
            return this;
        };

        this.remove = function (key) {
            if (!this._options || this._options.length == 0) return;
            for (var i = 0; i < this._options.length; i++) {
                if (this._options[i][0].replace('#disabled', '') == key) {
                    this._options.splice(i, 1);
                    return;
                }
            }
        };

        this.setDisabled = function (key, isDisabled) {
            if (arguments.length < 2) isDisabled = true;
            if (!this._options || this._options.length == 0) return;
            for (var i = 0; i < this._options.length; i++) {
                var k = this._options[i][0];
                if (k.replace('#disabled', '') == key) {
                    if (isDisabled) {
                        if (k.indexOf('#disabled') < 0) this._options[i][0] = k + '#disabled';
                    }
                    else {
                        this._options[i][0] = k.replace('#disabled', '')
                    }
                    return;
                }
            }
        };

        this.toDS = function (AddEmpty) {
            if (AddEmpty) {
                if (this._options.length === 0) {
                    this._options.push(['', '', '']);
                } else {
                    if (this._options[0] !== '' || this._options[0][0] !== '') {
                        this._options.unshift(['', '', '']);
                    }
                }
            }
            return JSON.stringify(this._options);
        };

        if (ds) {
            _options = _miss_fun.InitiSelectDS(ds);
        }
    },

    /**iCheckBox*/
    iCheckBox: function (id) {
        if (this.constructor !== ictr.iCheckBox) return new ictr.iCheckBox(id); //以new返回对象
        this.Title = '';
        this.id = id;
        this.CtrType = 'iCheckBox';
        this.Width = 0;
        this.Size = 'normal';
        this.listStyle = 'horizontal';
        this.Disabled = false;
        this.BindField = '';
        this.ExtAttr = {};
        this.iCheckBoxType = 'single';
        this.Value = '';
        this.Items = '';
        this.style = '';
        this.Required = false;
        this.text = '';

        this.GetValue = function () { return this.Value; };

        this.GetHtml = function () {
            if (!this.id) {
                if (this.BindField) {
                    this.id = this.BindField;
                } else {
                    this.id = "ichkbox" + Math.random().toString().replace('-', '').replace('.', '');
                }
            } else {
                if (!this.BindField) this.BindField = this.id;
            }

            if (this.iCheckBoxType === 'single' && this.text && !this.Items) {
                this.Items = this.text;
                this.iCheckBoxType = 'checkbox';
            }

            if (this.iCheckBoxType === 'slide' || this.iCheckBoxType === 'single') {
                return GetHtml_single(this);
            }

            var strHtml = "<div id=\"" + this.id + "\" ctrtype=\"iCheckBox\" class=\"ictr-wrap-checkbox-wrap\"";
            strHtml += " checkboxtype=\"" + this.iCheckBoxType + "\"";
            strHtml += " bindfield=\"" + this.BindField + "\"";
            if (this.Disabled == true) strHtml += " disabled=\"disabled\"";
            if (this.style) strHtml += " style=\"" + this.style + "\"";
            strHtml += " ExtAttr=\"" + EncodeHtml(JSON.stringify(this.ExtAttr)) + "\"";
            strHtml += ">";


            var ss = this.Items.split('~');
            var name = this.id;
            var htmListStyle = this.listStyle === 'vertical' ? " style=\"display: block;\"" : "";

            for (var i = 0; i < ss.length; i++) {
                var s = $.trim(ss[i]);

                var htmDisabled = this.Disabled ? " disabled" : "";
                if (s.toLowerCase().indexOf("#disabled#") >= 0) {
                    s = s.replace("#disabled#", "");
                    if (!htmDisabled) htmDisabled = " disabled";
                }

                strHtml += "<label class=\"ictr-wrap-checkbox\"" + htmDisabled + htmListStyle;
                strHtml += "><input type=\"" + this.iCheckBoxType + "\" name=\"" + name + "\"" + htmDisabled + " itemindex=\"" + i + "\" />";
                strHtml += s ? s : "&nbsp;";
                strHtml += "</label>";
            }

            strHtml += "</div>";

            return strHtml;

            function GetHtml_single(self) {

                var htmClass = self.Size === "normal" ? "" : (" " + self.Size);

                if (self.iCheckBoxType === "slide") htmClass += (htmClass === "" ? "" : " ") + self.iCheckBoxType;

                var strHtml = "";
                if (self.iCheckBoxType == "single") {
                    strHtml += "<div class=\"singlecheckbox\" id =\"" + self.id + "\" ctrtype=\"iCheckBox\"";
                    strHtml += " checkboxtype=\"" + self.iCheckBoxType + "\"";
                    strHtml += " bindfield=\"" + self.BindField + "\"";
                    strHtml += ">";
                    strHtml += "<input type=\"checkbox\" ";
                }
                else {
                    strHtml += "<input type=\"checkbox\" id=\"" + self.id + "\" ctrtype=\"iCheckBox\"";
                    strHtml += " checkboxtype=\"" + self.iCheckBoxType + "\"";
                    strHtml += " bindfield=\"" + self.BindField + "\"";
                }
                if (htmClass) strHtml += " class=\"" + htmClass + "\"";
                if (self.Disabled) strHtml += " disabled=\"disabled\"";
                if (self.Value == "1" || self.Value == "true" || self.Value == "√" || self.Value == true) strHtml += " checked=\"checked\"";
                if (self.style) strHtml += " style=\"" + self.style + "\"";
                strHtml += " ExtAttr=\"" + EncodeHtml(JSON.stringify(self.ExtAttr)) + "\"";
                strHtml += " />";

                if (self.iCheckBoxType === "single") strHtml += "</div>";

                return strHtml;
            }
        };
    },

    /**
     * GridView行双击 (返回: ictr)
     * ----------
     * $igv :   iGridView的JQuery对象
     * $tr :    当前行的JQuery对象
     * igvID :  iGridView 的 ID
     * @param {($igv:JQuery, $tr:JQuery, igvID:string)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewRowDblClick: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvDblclick.push(fun);
        else if (fun === false) ictr._rundata_.igvDblclick.length = 0;
        else $.each(ictr._rundata_.igvDblclick, function () { this.apply(ictr.iGridViewRowDblClick.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView行单击 (返回: ictr)
     * ----------
     * $igv :   iGridView的JQuery对象
     * $tr :    当前行的JQuery对象
     * igvID :  iGridView 的 ID
     * @param {($igv:JQuery, $tr:JQuery, igvID:string)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewRowClick: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvRowclick.push(fun);
        else if (fun === false) ictr._rundata_.igvRowclick.length = 0;
        else $.each(ictr._rundata_.igvRowclick, function () { this.apply(ictr.iGridViewRowClick.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView向服务端请求数据前发生 (返回: ictr)
     * ----------
     * $igv :  iGridView 的JQuery对象
     * igvID : iGridView 的 ID
     * @param {($igv:JQuery, igvID:string)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewBeforeGetData: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvBeforeGetData.push(fun);
        else if (fun === false) ictr._rundata_.igvBeforeGetData.length = 0;
        else $.each(ictr._rundata_.igvBeforeGetData, function () { this.apply(ictr.iGridViewBeforeGetData.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView数据加载完毕后发生 (返回: ictr)
     * ----------
     * $igv :  iGridView 的JQuery对象
     * igvID : iGridView 的 ID
     * result : 查询Result
     * @param {($igv:JQuery, igvID:string, result:{})=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewLoaded: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvLoaded.push(fun);
        else if (fun === false) ictr._rundata_.igvLoaded.length = 0;
        else $.each(ictr._rundata_.igvLoaded, function () { this.apply(ictr.iGridViewLoaded.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView TreeClick时发生 (返回: ictr)
     * ----------
     * $obj :  +/-Image JQuery对象
     * $dtr :  非冻结行
     * $ftr :  冻结行
     * isExpand :  是否是展开
     * $igv : iGridView 的JQuery对象
     * @param {($obj, $dtr, $ftr, isExpand:boolean, $igv:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewTreeClick: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvTreeClick.push(fun);
        else if (fun === false) ictr._rundata_.igvTreeClick.length = 0;
        else $.each(ictr._rundata_.igvTreeClick, function () { this.apply(ictr.iGridViewTreeClick.caller, arguments); });
        return ictr;
    },

    /**
     * iReport数据加载完毕后发生 (返回: ictr)
     * ----------
     * Result : result
     * $irpt :  iReport 的JQuery对象
     * result :  查询返回Result
     * @param {(Result:{}, $irpt:JQuery, result:{})=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iReportLoaded: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.irptLoaded.push(fun);
        else if (fun === false) ictr._rundata_.irptLoaded.length = 0;
        else $.each(ictr._rundata_.irptLoaded, function () { this.apply(ictr.iReportLoaded.caller, arguments); });
        return ictr;
    },

    /**
     * iReport向服务端请求数据前发生 (返回: ictr)
     * ----------
     * $irpt :  iReport 的 JQuery对象
     * irptID : iReport 的 ID
     * @param {($irpt:JQuery, irptID:string)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iReportBeforeGetData: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.irptBeforeGetData.push(fun);
        else if (fun === false) ictr._rundata_.irptBeforeGetData.length = 0;
        else $.each(ictr._rundata_.irptBeforeGetData, function () { this.apply(ictr.iReportBeforeGetData.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView单元格编辑前发生(编辑控件已生成),返回:true=继续编辑，false=终止编辑
     * 返回: ictr
     * ----------
     * colName :   列名
     * $td :       当前<TD>的JQuery对象
     * ctrObj :    {ctr, type}编辑控件对象（iText/iSelect/iReference...)
     * $igv :      iGridView的JQuery对象
     * ----------
     * 返回值 false: 禁止编辑，true：继续编辑
     * 返回值: 当应用于<td tdedit>时： new ictr.ixxx(): 
     * @param {(colName:string, $td: JQuery, ctrObj:{ctr:{}, type:string}, $igv:JQuery)=>boolean|{}} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewInitEditCtrl: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvInitEditCtrl.push(fun);
        else if (fun === false) ictr._rundata_.igvInitEditCtrl.length = 0;
        else $.each(ictr._rundata_.igvInitEditCtrl, function () { this.apply(ictr.iGridViewInitEditCtrl.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView单元格编辑完成后发生(编辑控件消失前)
     * 返回: ictr
     * ----------
     * colName : 列名 (删除行时，colName='')
     * $td :     当前<TD>的JQuery对象 (删除行时，$td=空JQuery对象)
     * $ctr :    编辑控件JQuery对象 (删除行时，$ctr=空JQuery对象)
     * $igv :    iGridView的JQuery对象
     * 
     * --$td有两个attr: _beforeedithtml, _beforeeditvalue, 分别记录编辑前的 html 和 rawvalue
     * --删除行时，colName='' , $td/$ctr=空JQuery对象
     * @param {(colName:string, $td: JQuery, $ctr:JQuery, $igv:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewModified: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvModified.push(fun);
        else if (fun === false) ictr._rundata_.igvModified.length = 0;
        else $.each(ictr._rundata_.igvModified, function () { this.apply(ictr.iGridViewModified.caller, arguments); });
        return ictr;
    },

    /**
    * iGridView删除行前发生 (返回: ictr)
    * ----------
    * $tr :   要删除的行
    * $igv :  iGridView的JQuery对象
    * igvID : iGridView的ID
    * @param {JQuery} $tr 要删除的行
    * @param {JQuery} $igv iGridView的JQuery对象
    * @param {string} igvID iGridView的ID
    */
    iGridViewBeforeDeleteRow: function ($tr, $igv, igvID) {
        return true;
    },

    /**
    * iGridView删除行后发生 (返回: ictr)
    * ----------
    * $tr :   已删除的行
    * $igv :  iGridView的JQuery对象
    * igvID : iGridView的ID
    * @param {JQuery} $tr 已删除的行
    * @param {JQuery} $igv iGridView的JQuery对象
    * @param {string} igvID iGridView的ID
    */
    iGridViewAfterDeleteRow: function ($tr, $igv, igvID) { },

    /**
    * iGridView单元格编辑完成后发生（编辑控件消失后）
     * 返回: ictr
     * ----------
    * colName : 列名 (删除行时，colName='')
    * $td :     当前<TD>的JQuery对象 (删除行时，$td=空JQuery对象)
    * $igv :    iGridView的JQuery对象
    * 
     * --删除行时，colName='' , $td=空JQuery对象
    * @param {(colName:string, $td: JQuery, $igv:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewAfterModified: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvAfterModified.push(fun);
        else if (fun === false) ictr._rundata_.igvAfterModified.length = 0;
        else $.each(ictr._rundata_.igvAfterModified, function () { this.apply(ictr.iGridViewAfterModified.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView 复选框（CheckBox）点击时发生 (返回: ictr)
     * ----------
     * $igv:      iGridView的JQuery对象
     * checklist: 选中的项列表（,分隔）
     * igvID : iGridView 的 ID
     * $chkbox : checkbox的jQuery对象(如不是点击,则返回false)
     * @param {($igv:JQuery, checklist:string, igvID:string, $chkbox)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewCheckBoxChanged: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvCheckBoxChanged.push(fun);
        else if (fun === false) ictr._rundata_.igvCheckBoxChanged.length = 0;
        else $.each(ictr._rundata_.igvCheckBoxChanged, function () { this.apply(ictr.iGridViewCheckBoxChanged.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView 批量导入时发生 (返回: ictr)
     * ----------
     * $igv :  iGridView的JQuery对象
     * $tr :   $tr
     * val :   导入的值
     * @param {($igv:JQuery, $tr:JQuery, val:[])=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGridViewBatchImporting: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igvBatchImporting.push(fun);
        else if (fun === false) ictr._rundata_.igvBatchImporting.length = 0;
        else $.each(ictr._rundata_.igvBatchImporting, function () { this.apply(ictr.iGridViewBatchImporting.caller, arguments); });
        return ictr;
    },

    /**
     * iGridView 批量导入前发生 (返回: true=继续导入, false=终止导入)
     * @param {any} $igv
     * @param {any} data
     */
    iGridViewBeforeBatchImport: function ($igv, data) { return true; },

    /**
     * iGridView 批量导入后发生
     * @param {any} $igv
     * @param {any} data
     */
    iGridViewBatchImported: function ($igv, data) { },

    /**
     * AfterChange (返回: ictr)
     * ----------
     * $ctr :     控件JQuery对象
     * ctrID :    控件ID
     * val :      值
     * tabText / isManualChange: （当控件为iTabs时使用）iTabs选中的页签文本, 是否手动改动值
     * @param {($itabs:JQuery, ctrID:string, val:any, tabText:string)=>boolean} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    AfterChange: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.afterChange.push(fun);
        else if (fun === false) ictr._rundata_.afterChange.length = 0;
        else $.each(ictr._rundata_.afterChange, function () { this.apply(ictr.AfterChange.caller, arguments); });
        return ictr;
    },

    /**
    * Edit页面BeforeSave (返回false阻止保存)
    * 返回: ictr
    * ----------
    * isSubmit : 是否是提交
    * @param {(isSubmit:boolean)=>boolean} fun 回调函数（传入false清空回调函数）
    * @returns {{}}
    */
    BeforeSave: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.beforeSave.push(fun);
        else if (fun === false) ictr._rundata_.beforeSave.length = 0;
        else $.each(ictr._rundata_.beforeSave, function () { this.apply(ictr.BeforeSave.caller, arguments); });
        return ictr;
    },
    /**
    * Edit页面AfterSave
    * 返回: ictr
    * ----------
    * ret : 返回值
    * isSubmit : 是否是提交
    * @param {(ret, isSubmit:boolean)=>boolean} fun 回调函数（传入false清空回调函数）
    * @returns {{}}
    */
    AfterSave: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.afterSave.push(fun);
        else if (fun === false) ictr._rundata_.afterSave.length = 0;
        else $.each(ictr._rundata_.afterSave, function () { this.apply(ictr.AfterSave.caller, arguments); });
        return ictr;
    },
    /**
    * List页面BeforeDelete (返回false阻止删除)
    * 返回: ictr
    * ----------
    * keyValues : 选中的值（多选用,隔开）
    * @param {(keyValues:string)=>boolean} fun 回调函数（传入false清空回调函数）
    * @returns {{}}
    */
    BeforeDelete: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.beforeDelete.push(fun);
        else if (fun === false) ictr._rundata_.beforeDelete.length = 0;
        else $.each(ictr._rundata_.beforeDelete, function () { this.apply(ictr.BeforeDelete.caller, arguments); });
        return ictr;
    },
    /**
    * List页面AfterDelete (返回: ictr)
    * ----------
    * ret : 返回值
    * keyValues : 选中的值（多选用,隔开）
    * @param {(ret:string, keyValues:string)=>boolean} fun 回调函数（传入false清空回调函数）
    * @returns {{}}
    */
    AfterDelete: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.afterDelete.push(fun);
        else if (fun === false) ictr._rundata_.afterDelete.length = 0;
        else $.each(ictr._rundata_.afterDelete, function () { this.apply(ictr.AfterDelete.caller, arguments); });
        return ictr;
    },

    /**
     * iReference弹出框数据加载完毕后执行该脚本
     */
    iReferenceFormLoaded: function (ctrID) { },

    /**
     * iReference弹出框选择后的检查脚本（返回false则阻止选择）
     */
    iReferenceFormSelected: function (ctrID, value) { return true; },

    /**
     * iTabs页签切换前发生（返回值 false:禁止切换，true：继续切换）
     * 返回: ictr
     * ----------
     * $itabs:   控件JQuery对象
     * index:    iTabs选中的页签索引
     * tabText:  iTabs选中的页签文本
     * ----------
     * 返回值 false: 禁止切换，true：继续切换
     * @param {($itabs:JQuery, index:number, tabText:string)=>boolean} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iTabsBeforeChange: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.itabsBeforeChange.push(fun);
        else if (fun === false) ictr._rundata_.itabsBeforeChange.length = 0;
        else $.each(ictr._rundata_.itabsBeforeChange, function () { this.apply(ictr.iTabsBeforeChange.caller, arguments); });
        return ictr;
    },

    /**
     * iTabs页签（加载时）切换为显示发生（只运行一次）
     * 返回: ictr
     * ----------
     * $itabs:   控件JQuery对象
     * index:    iTabs选中的页签索引
     * tabText:  iTabs选中的页签文本
     * @param {($itabs:JQuery, index:number, tabText:string)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iTabsPanelLoad: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.itabsPanelLoad.push(fun);
        else if (fun === false) ictr._rundata_.itabsPanelLoad.length = 0;
        else $.each(ictr._rundata_.itabsPanelLoad, function () { this.apply(ictr.iTabsPanelLoad.caller, arguments); });
        return ictr;
    },

    /**
     * iReference设置值返回时发生
     * 返回: ictr
     * ----------
     * $Ref:   控件JQuery对象
     * values:  新值
     * @param {($Ref:JQuery, values:{})=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iReferenceRender: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.iReferenceRenderValue.push(fun);
        else if (fun === false) ictr._rundata_.iReferenceRenderValue.length = 0;
        else $.each(ictr._rundata_.iReferenceRenderValue, function () { this.apply(ictr.iReferenceRenderValue.caller, arguments); });
        return ictr;
    },

    /**
    * iTree Node 复选框变化前发生
    * ----------
    * $node:   控件JQuery对象（JQuery）
    * checked: 是否选中状态（boolean）
    * $tree    控件JQuery对象（JQuery）
    * @param {JQuery} $node node
    * @param {Boolean} checked  是否选中状态
    * @param {JQuery} $tree iTree
    */
    iTreeNodeBeforeChangeChecked: function ($node, checked, $tree) {
        return true;
    },

    /**
    * iTree Node 复选框变化时发生 (返回: ictr)
    * ----------
    * $node:   控件JQuery对象
    * checked: 是否选中状态
    * relaVal  关联父（子）影响的值列表
    * $tree    控件JQuery对象
    * @param {($node:JQuery, checked:boolean, relaVal:[], $tree:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iTreeNodeCheckedChanged: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.itreeNodeCheckedChanged.push(fun);
        else if (fun === false) ictr._rundata_.itreeNodeCheckedChanged.length = 0;
        else $.each(ictr._rundata_.itreeNodeCheckedChanged, function () { this.apply(ictr.iTreeNodeCheckedChanged.caller, arguments); });
        return ictr;
    },

    /**
    * iTree Node 选中时发生 (返回: ictr)
    * ---------
    * $node 节点JQuery对象
    * $tree 控件JQuery对象
    * @param {($node:JQuery, $tree:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iTreeNodeSelected: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.itreeNodeSelected.push(fun);
        else if (fun === false) ictr._rundata_.itreeNodeSelected.length = 0;
        else $.each(ictr._rundata_.itreeNodeSelected, function () { this.apply(ictr.iTreeNodeSelected.caller, arguments); });
        return ictr;
    },

    /**
    * iMenus 菜单项 Click 时发生 (返回: ictr)
    * ---------
    * menuID:      菜单ID，如未点击，仅仅是消失，则该ID为null
    * $TitleSpan:  点击项的Title的<span>的JQuery对象
    * @param {(menuID:string, $TitleSpan:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iMenuClick: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.imenuClick.push(fun);
        else if (fun === false) ictr._rundata_.imenuClick.length = 0;
        else $.each(ictr._rundata_.imenuClick, function () { this.apply(ictr.iMenuClick.caller, arguments); });
        return ictr;
    },

    /**
     * 组控件打开或关闭时发生 (返回: ictr)
     * ---------
     * $iGroup:       当前控件
     * rawHeight:     原始高度
     * currentHeight: 当前高度
     * @param {($iGroup:JQuery, rawHeight:number, currentHeight:number)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGroupToggle: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igroupToggle.push(fun);
        else if (fun === false) ictr._rundata_.igroupToggle.length = 0;
        else $.each(ictr._rundata_.igroupToggle, function () { this.apply(ictr.iGroupToggle.caller, arguments); });
        return ictr;
    },

    /**
     * 组控件打开（加载明细）时发生，只发生一次 (返回: ictr)
     * ---------
     * $iGroup:       当前控件
     * @param {($iGroup:JQuery)=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}}
     */
    iGroupExpand: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.igroupExpand.push(fun);
        else if (fun === false) ictr._rundata_.igroupExpand.length = 0;
        else $.each(ictr._rundata_.igroupExpand, function () { this.apply(ictr.igroupExpand.caller, arguments); });
        return ictr;
    },

    /**
    * 重新提交e9审批
    */
    ReSubmitLandrayBpm: function () {
        _miss_fun.isPauseValidateLandrayBpm = true;
        window.parent.document.getElementById('process_review_button').click();
    },

    /**
     * 打印前发生 (返回: ictr)
     * --------------------------
     * 可设置：_miss_fun._IsLandscape（true:横向/false:纵向, 默认:false)
     * @param {()=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}} 
     */
    onPrint: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.onPrint.push(fun);
        else if (fun === false) ictr._rundata_.onPrint.length = 0;
        else $.each(ictr._rundata_.onPrint, function () { this.apply(ictr.onPrint.caller, arguments); });
        return ictr;
    },

    /**
    * 构建iCalendar时发生(day:日期天 5, fulldate:日期 2019-03-05, stat:状态 prev, curr, next, $td:单元格, ctrID:控件ID)
    * 应放在页面头部脚本中执行（在xxx.iControls()前。
    * @param {number} day 日期天 5
    * @param {string} fulldate 日期 2019-03-05
    * @param {string} stat 状态 prev, curr, next
    * @param {JQuery} $td 单元格
    * @param {string} ctrID 控件ID
    * @returns {string} 单元格内容
    */
    BuildCalendar: function (day, fulldate, stat, $td, ctrID) {
        return "";
    },

    /**
    * 构建iCalendar前发生(year：日期年 2019, month：日期月 05， ctrID:控件ID) 
    * 应放在页面头部脚本中执行（在xxx.iControls()前。
    * @param {number} year 日期年 2019
    * @param {string} month 日期月 05
    * @param {string} ctrID 控件ID
    */
    BeforeBuildCalendar: function (year, month, ctrID) {
    },

    /**
    * iAttachment选择文件完成时执行
    * IsCustomUpload=true时有效
    * @param {Jquery} $iatt iAttachment控件
    * @param {Array} attData 已选择的文件
    * @param {Function} callback 执行完后的回调函数
    */
    iAttCustomSelected: function ($iatt, attData, callback) {
        callback();
    },

    /**
    * iAttachment选择文件完成，准备上传前执行
    * 返回值，false:中止上传， true:继续上传
    * @param {Jquery} $iatt iAttachment控件
    * @param {Array} files 已选择的文件
    */
    iAttFileSelected: function ($iatt, files) {
        return true;
    },

    /**
     * 执行页面搜索时触发（Desktop页面顶部的搜索栏）
     * --------------------------
     * @param {()=>void} fun 回调函数（传入false清空回调函数）
     * @returns {{}} 
     */
    OnPageSearching: function (fun) {
        if (fun && fun.constructor === Function) ictr._rundata_.onPageSearching = fun;
        else if (fun === false) ictr._rundata_.onPageSearching = null;
        else {
            ictr._rundata_.onPageSearching && ictr._rundata_.onPageSearching.apply(ictr.OnPageSearching.caller, arguments);
        }
        return ictr;
    },

    /** 演示 */
    Intro: {
        step: 0,
        isRunning: false,
        _isShowing: false,
        next: function (callback) {
            if (this._isShowing) return true;
            this.step++;
            return this.show(callback);
        },
        prev: function (callback) {
            if (this._isShowing) return true;
            this.step--;
            return this.show(callback);
        },
        show: function (callback) {
            if (this._isShowing) return true;
            this._isShowing = true;
            this.isRunning = true;
            if (this.step <= 0) this.step = 1;
            var self = this;
            this.stepStart(this.step);

            var allheight = window.innerHeight;
            var allwidth = window.innerWidth;

            $('.intro-tempelem').remove();

            var $el = $('[intro^="' + this.step + ':"],[intro="' + this.step + '"]');
            if ($el.length === 0) {
                if (this.data && this.data[this.step]) {
                    $el = $(this.data[this.step].el);
                    if ($el.length === 0) {
                        self.exit();
                        this._isShowing = false;
                        return false;
                    }
                    $el.addClass('intro-tempelem');
                    $el.attr('intro', this.step + ':' + this.data[this.step].t);
                    $('.intro-helper').remove();
                    $el.zoomOpen(function () { showIntro(callback); });
                }
                else if (self.settings.isLooping) {
                    self.step = 1;
                    self._isShowing = false;
                    return self.show();
                }
                else {
                    this.exit();
                    this._isShowing = false;
                    return false;
                }
                return true;
            }
            showIntro(callback);
            return true;
            function showIntro() {
                $('.intro-elem').removeClass('intro-elem');
                if ($('.intro-mask').length === 0) $('body').append('<div class="intro-mask" style="opacity: ' + self.settings.opacity + ';"></div>')
                var $helper = $('.intro-helper');
                var needAdd = $helper.length === 0;
                if ($helper.length === 0) {
                    $helper = $('<div class="intro-helper"></div>');
                    if (self.settings.isShowTips) {
                        $helper.append('<div class="intro-number"></div><div class="intro-tooltip"><div class="arrow top"></div><div class="intro-text"></div><div class="intro-buttons"><span style="margin-right:8px;" class="button intro-close">Close</span><span class="button intro-prev">上一步</span><span class="button intro-next">下一步</span></div></div>');
                        $helper.on('click', '.intro-close', function () { self.exit(); });
                        $helper.on('click', '.intro-prev', function () {
                            self.prev();
                        });
                        $helper.on('click', '.intro-next', function () {
                            self.next();
                        });
                    }
                }
                if (self.settings.isShowTips) {
                    var text = '';
                    $el.each(function () {
                        var text1 = $(this).attr('intro');
                        text1 = text1.substr(text1.indexOf(':') + 1) || '';
                        if (text1.length > text.length) text = text1;
                    });
                    var $number = $helper.find('.intro-number').text(self.step);
                    $helper.find('.intro-text').html(text);
                    if ($('[intro^="' + (self.step + 1) + ':"]').length === 0 && (!self.data || !self.data[self.step + 1])) {
                        $helper.find('.intro-next').attr('disabled', 'true')
                    }
                    else {
                        $helper.find('.intro-next').removeAttr('disabled');
                    }
                    if ($('[intro^="' + (self.step - 1) + ':"]').length === 0 && (!self.data || !self.data[self.step - 1])) {
                        $helper.find('.intro-prev').attr('disabled', 'true');
                    }
                    else {
                        $helper.find('.intro-prev').removeAttr('disabled');
                    }
                }

                var $b = self.settings.body;
                if (!$b) {
                    $b = $('body');
                    if (!$b.ScrollBarWidth()) {
                        $b = $b.find('>div');
                        if (!$b.ScrollBarWidth()) $b = $b.find('>div');
                    }
                    self.settings.body = $b;
                }
                $b.off('scroll');

                var p = getAllPosition($el);
                if (self.settings.isKeepMiddle) {
                    var rawst = $b.scrollTop();
                    var scrolltop = p.top + rawst - (allheight - (p.bottom - p.top)) / 2;
                    if (scrolltop < 0) scrolltop = 0;
                    $b.scrollTop(scrolltop);
                    scrolltop = $b.scrollTop();
                    p.top = p.top + rawst - scrolltop;
                    p.bottom = p.bottom + rawst - scrolltop;
                }
                $b.on('scroll', function () {
                    var p = getLastPosition(getAllPosition($el));
                    $helper.css({ top: p.top + 'px', left: p.left + 'px', width: p.width + 'px', height: p.height + 'px' });
                });

                p = getLastPosition(p);
                $helper.css({ top: p.top + 'px', left: p.left + 'px', width: p.width + 'px', height: p.height + 'px' });
                if (needAdd) $('body').append($helper);

                if (self.settings.isShowTips) {
                    var $t = $helper.find('.intro-tooltip');
                    var th = $t.outerHeight();
                    var ttop = th + 2;
                    if (th + p.bottom > allheight && th < p.top) {
                        ttop = -th - 6;
                        $t.find('.arrow').removeClass('top').addClass('bottom');
                    }
                    else {
                        $t.find('.arrow').removeClass('bottom').addClass('top');
                    }
                    $t.css({ left: '0px', top: ttop + 'px' });
                    $number.css('left', '-16px');
                    if ($number.offset().left < 0) $number.css('left', '0px');
                }
                setTimeout(function () {
                    $el.addClass('intro-elem');
                    self.stepDone(self.step, $el, $helper);
                    if (callback) callback(self.step, $el, $helper);
                    self._isShowing = false;
                    if (self.settings.timehandler) {
                        clearTimeout(self.settings.timehandler);
                        self.settings.timehandler = setTimeout(function () { self.auto(); }, self.settings.speed);
                    }
                }, 300);
            }

            function getAllPosition($el) {
                var top = 99999, left = 99999, bottom = -99999, right = -99999;
                $el.each(function () {
                    var $thisel = $(this);
                    var offset = $thisel.offset();
                    var bottom1 = offset.top + $thisel.outerHeight();
                    var right1 = offset.left + $thisel.outerWidth();
                    if (top > offset.top) top = offset.top;
                    if (left > offset.left) left = offset.left;
                    if (right < right1) right = right1;
                    if (bottom < bottom1) bottom = bottom1;
                });
                return { top: top, left: left, right: right, bottom: bottom };
            }

            function getLastPosition(p) {
                p.top -= 10;
                p.left -= 10;
                p.bottom += 10;
                p.right += 10;
                if (p.top < 0) p.top = 0;
                if (p.top > allheight - 2) p.top = allheight - 2;
                if (p.left < 0) p.left = 0;
                if (p.left > allwidth - 2) p.left = allwidth - 2;
                if (p.bottom > allheight) p.bottom = allheight;
                if (p.right > allwidth) p.right = allwidth;
                p.width = p.right - p.left;
                p.height = p.bottom - p.top;
                if (p.width < 0) p.width = 0;
                if (p.height < 0) p.height = 0;
                return p;
            }
        },
        exit: function () {
            if (this.settings.timehandler) {
                clearTimeout(this.settings.timehandler);
                this.settings.timehandler = null;
            }
            $('.intro-tempelem').remove();
            $('.intro-helper,.intro-mask').hide('fast', function () { $('.intro-helper,.intro-mask').remove(); });
            this.exitIntro();
            this.step = 0;
            this.isRunning = false;
        },
        auto: function (speed) {
            var self = this;
            if (speed) self.settings.speed = speed;
            autoshow();
            function autoshow() {
                if (self.next() === false) return;
                self.settings.timehandler = setTimeout(function () { autoshow(); }, self.settings.speed);
            }
        },
        settings: { isLooping: false, isShowTips: true, isKeepMiddle: true, speed: 3000, opacity: 0.6, body: null, timehandler: null },
        stepStart: function (stepIndex) { },
        stepDone: function (stepIndex, $el, $helper) { },
        exitIntro: function () { },
        data: {}
    },

    /** iTextType */
    iTextType: { Editor: "Editor", TextArea: "TextArea", String: "String", Integer: "Integer", Decimal: "Decimal", Percent: "Percent", Date: "Date", DateTime: "DateTime", Time: "Time", Period: "Period", PeriodM: "PeriodM", PeriodQ: "PeriodQ", PeriodH: "PeriodH", Hidden: "Hidden", Scan: "Scan" },

    /** iTextAlign */
    iTextAlign: { auto: "auto", left: "left", center: "center", right: "right" },

    /** DataTable: { Columns:[], Rows:[] }  */
    DataTable: function () {
        this.Columns = [];
        this.Rows = [];
        this.addColumn = function (name) { this.Columns.push(name); return this; };
        this.addRow = function (row) { this.Rows.push(row); return this; };
    },

    /** 运行变量 */
    _rundata_: {
        igvDblclick: [],
        igvRowclick: [],
        igvBeforeGetData: [],
        igvLoaded: [],
        igvTreeClick: [],
        irptLoaded: [],
        irptBeforeGetData: [],
        igvInitEditCtrl: [],
        igvModified: [],
        igvAfterModified: [],
        igvCheckBoxChanged: [],
        igvBatchImporting: [],
        afterChange: [],
        beforeSave: [],
        afterSave: [],
        beforeDelete: [],
        afterDelete: [],
        itabsBeforeChange: [],
        itabsPanelLoad: [],
        itreeNodeCheckedChanged: [],
        itreeNodeSelected: [],
        imenuClick: [],
        igroupToggle: [],
        igroupExpand: [],
        iReferenceRenderValue: [],
        onPrint: [],
        ajaxDoneCallback: [],
        onPageSearching: null
    }
};

/** 调用服务端方法 */
var svr = {
    invoke: function (MethodName, assemblyName, loadingText) {
        if (!assemblyName) assemblyName = this._currentAssembly;
        var caller = arguments.callee.caller;
        var argValues = [];
        for (var i = 0; i < caller.arguments.length; i++) {
            argValues.push(caller.arguments[i]);
        }
        var argNames = caller.toString();
        argNames = argNames.toString().substring(argNames.indexOf('(') + 1, argNames.indexOf(')')).split(",").map(function (arg) { return $.trim(arg.replace(/\/\*.*\*\//, "")); }).filter(function (arg) { return arg; });

        var _callback = null;
        var _para = null;
        if (argValues.length > 1) {
            if (argValues[argValues.length - 1] && argValues[argValues.length - 1].constructor === Function) {
                _callback = argValues.pop();
            }
            else if (argValues[argValues.length - 2] && argValues[argValues.length - 2].constructor === Function) {
                _para = argValues.pop();
                _callback = argValues.pop();
            }
        }
        else if (argValues.length === 1) {
            if (argValues[0] && argValues[0].constructor === Function) _callback = argValues.pop();
        }
        if (argValues.length !== argNames.length) {
            openAlert('调用服务端函数的参数数量不匹配：' + assemblyName + '=>' + MethodName + '.');
            return;
        }

        if (loadingText) openLoading(loadingText);

        var RequestArgs = {};
        for (var i = 0; i < argValues.length; i++) {
            RequestArgs[argNames[i]] = (argValues[i] === undefined ? null : argValues[i]);
        }

        var jo = {
            Controller: assemblyName,
            MethodName: MethodName,
            CurrentUser: this._currentUser,
            Args: JSON.stringify(RequestArgs)
        };
        var rettemp = null;
        var jqXhr = $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            async: !!_callback,
            cache: false,
            timeout: 7200000,
            url: "/api/ajax",
            data: jo
        }).done(function (ret) {
            if (ret && ret.constructor === String && ret.length > 10 && ret.substr(0, 10) === "ajaxerror:") {
                closeLoading();
                openAlert(ret.replace(/\r\n/g, '<br>'));
                return null;
            }
            if (ret === undefined || ret === null || ret === "")
                ret = "";
            else
                ret = $.JsonObject(ret);

            closeLoading();
            if (!_callback) {
                rettemp = ret;
            }
            else {
                _callback.call(window, ret, _para);
            }
        }).fail(function (ret) {
            closeLoading();
            setTimeout(function () {
                if (window._miss_unloaded) return;
                openAlert("Ajax调用失败！" + ret.statusText);
                if (_callback) _callback.call(window, "error:" + ret.statusText, _para);
            }, 0);
        });

        if (_callback) {
            return jqXhr;
        }
        else {
            return rettemp;
        }
    },

    /**向服务端写入日志信息 ( [logType] : 0=error, 1=message, 2=other ) */
    Log: function (title, detail, logType) {
        var errData = {
            title: title || '',
            detail: detail || '',
            logType: logType || 0,
            browser: $.browser.getBrowser(),
            useragent: navigator.userAgent,
            href: location.href
        };

        try {
            $.ajax({
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                url: "/api/utility/PostClientError",
                data: { errData: $.toJsonString(errData) },
                success: function () { }
            });
        }
        catch (e) { }
    },

    /**设置当前主题到服务端 */
    setCurrentTheme: function (callback) {
        var theme = window.localStorage.getItem("defaultTheme") || "gray";
        var url = "/api/i18n/SetCurrentTheme?name=" + encodeURIComponent(theme);
        $.ajax({
            type: "GET",
            cache: false,
            url: url,
            async: !!callback
        }).done(function () {
            if (callback) callback.call(window);
        })
    },

    /**获取Session级临时值 */
    getTempValue: function () {
        return $.GetRemoteData("/api/common/getTempValue");
    },
    /**设置Session级临时值 */
    setTempValue: function (val, _callback) {
        var url = "/api/common/setTempValue";
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            async: _callback != null,
            cache: false,
            url: url,
            data: { val: val }
        }).done(function () {
            if (_callback) _callback.call(window);
        }).fail(function (xhr) {
            var errmsg = 'setTempValue调用失败, 无法连接服务器, status:' + xhr.statusText + '(' + xhr.status + '),readyState:' + xhr.readyState;
            console.log(errmsg)
            openAlert(errmsg);
        });
    },

    /**获取全局临时值 */
    getPublicTempValue: function (key) {
        return $.GetRemoteData("/api/common/getPublicTempValue?key=" + key);
    },
    /**设置全局临时值 */
    setPublicTempValue: function (val, _callback) {
        var url = "/api/common/setPublicTempValue";
        var retValue = '';
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            async: _callback != null,
            cache: false,
            url: url,
            data: { val: val }
        }).done(function (ret) {
            retValue = ret;
            if (_callback) _callback.call(window, ret);
        }).fail(function (ret) {
            openAlert("Ajax调用失败！" + ret.statusText);
        });
        return retValue;
    },

    /**获取系统参数 */
    getPublicParameter: function (key) {
        return $.GetRemoteData("/api/common/getPublicParameter?Key=" + key);
    },
    /**设置系统参数 */
    setPublicParameter: function (key, val, _callback) {
        var url = "/api/common/setPublicParameter";
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            async: _callback != null,
            cache: false,
            url: url,
            data: { Key: key, val: val }
        }).done(function () {
            if (_callback) _callback.call(window);
        }).fail(function (ret) {
            openAlert("Ajax调用失败！" + ret.statusText);
        });
    },

    /**根据 工号 获取 员工姓名 */
    getPersonName: function (userKey) {
        var storageKey = "personName~" + userKey;
        return SessionStorageTryGet(storageKey, function () {
            return $.GetRemoteData("/api/common/GetPersonName?UserKey=" + encodeURIComponent(userKey));
        });
    },
    /**根据 客户编码 获取 客户名称 */
    getCustName: function (CustCode) {
        var storageKey = "custName~" + CustCode;
        return SessionStorageTryGet(storageKey, function () {
            return $.GetRemoteData("/api/common/GetCustomerName?CustCode=" + encodeURIComponent(CustCode));
        });
    },
    /**根据 编码 获取 部门名称 */
    getDeptName: function (DeptCode) {
        var storageKey = "deptName~" + DeptCode;
        return SessionStorageTryGet(storageKey, function () {
            return $.GetRemoteData("/api/common/GetDeptName?DeptCode=" + encodeURIComponent(DeptCode));
        });
    },
    /**根据 编码 获取 职务名称 */
    getPositionName: function (PositionCode) {
        var storageKey = "positionName~" + PositionCode;
        return SessionStorageTryGet(storageKey, function () {
            return $.GetRemoteData("/api/common/GetPositionName?PositionCode=" + encodeURIComponent(DeptCode));
        });
    },
    /**根据 单号 获取 Landray审批流状态 */
    getBpmStatus: function (DocNo, _callback) {
        return $.GetRemoteData("/api/common/getBpmStatus?DocNo=" + encodeURIComponent(DocNo), _callback);
    },
    /**根据 单号 获取 Landray审批流信息(DetailStatus) */
    getBpmInfo: function (DocNo, _callback) {
        var url = "/api/common/getBpmInfo?DocNo=" + encodeURIComponent(DocNo);
        if (!_callback) {
            var ret = $.GetRemoteData(url);
            if (ret) ret = $.JsonObject(ret);
            return ret;
        }
        $.GetRemoteData(url, function (d) {
            if (d) d = $.JsonObject(d);
            _callback(d);
        });
    },

    getiReportCtrlData: function (value, dataType, extData, ctrID, value2, _callback) {
        if (value) {
            var url = "/api/common/getiReportCtrlData?c=" + encodeURIComponent(ctrID) + "&v=" + encodeURIComponent(value)
                + "&t=" + encodeURIComponent(dataType) + "&e=" + encodeURIComponent(extData) + "&v2=" + encodeURIComponent(value2);
            if (!_callback) {
                var ret = $.GetRemoteData(url);
                if (ret) ret = $.JsonObject(ret);

                if (_miss_fun.fnIsExist('GetiReportCtrlCustData')) {
                    ret = GetiReportCtrlCustData(ctrID, dataType, value, extData, value2, ret);
                }

                return ret;
            }
            $.GetRemoteData(url, function (d) {
                if (d) d = $.JsonObject(d);

                if (_miss_fun.fnIsExist('GetiReportCtrlCustData')) {
                    d = GetiReportCtrlCustData(ctrID, dataType, value, extData, value2, d);
                }
                _callback(d);
            });
        }
    },

    /** 获取文本对应的二维码图像的DataUrl */
    getBarCodeImgData: function (BarCode, format, _callback) {
        if (format && format.constructor === Function) {
            _callback = format;
            format = "QrCode";
        }
        format = format || "QrCode";
        return $.GetRemoteData("/api/common/GetBarCodeImgData?BarCode=" + encodeURIComponent(BarCode) + "&Format=" + format, _callback);
    },
};

/** miss-ui 系统用函数及变量 */

var _miss_fun = {
    _iAttURLData: {},

    //iAttFileSelected: function (type, obj, MethodName, Args, _callback) {
    iAttFileSelected: function (type, obj, args) {
        var $wrap;
        var _callback;
        if (type === 'custsendfile') {
            $wrap = obj;
            _callback = args._callback || null;
            CustSendfiles(args.MethodName, args.Args);
            return;
        }

        var data = new FormData();
        data.append("isPaste", type == 'paste' ? "true" : "false");

        if (type === 'takephoto' || type == 'paste') {
            $wrap = obj;
            var imgData = args;
            if ($wrap.attr('IsCustomUpload') == 'true') {
                if (!_miss_fun._iAttURLData[$wrap.attr('id')]) _miss_fun._iAttURLData[$wrap.attr('id')] = [];
                _miss_fun._iAttURLData[$wrap.attr('id')].push({ name: 'photo.jpg', size: imgData.length, file: null, data: imgData });
                ictr.iAttCustomSelected($wrap, _miss_fun._iAttURLData[$wrap.attr('id')], function () { $wrap.iAttLoadList(); });
                return;
            }
            data.append("imgUrlData", imgData);
        }
        else {
            var files;
            if (type === 'drag') {
                $wrap = obj;
                files = args;
            }
            else {
                files = obj.files;
                $wrap = $(obj).parent().parent();
            }
            if (!$wrap || !files || files.length == 0) return;

            var MaxCount = $wrap.attr('MaxCount') || '0';
            var MaxKBSize = $wrap.attr('MaxKBSize');
            if (!MaxKBSize) MaxKBSize = 20 * 1000;
            for (var i = 0; i < files.length; i++) {
                if (files[i].size > MaxKBSize * 1000) {
                    openAlert('文件大小不允许超过' + MaxKBSize + 'Kb!<br>' + files[i].name);
                    obj.value = '';
                    return;
                }
                var n = files[0].name;
                if (n.lastIndexOf('.') > 0) {
                    n = $.trim(n.substr(n.lastIndexOf('.')).toLowerCase());
                    if (n == '.exe' || n == '.com' || n == '.dll' || n == '.cmd' || n == '.bat' || n == '.sys'
                        || n == '.config' || n == '.vbs' || n == '.asp' || n == '.aspx' || n == '.jsp' || n == '.php') {
                        openAlert('不允许的文件类型：' + files[i].name);
                        obj.value = '';
                        return;
                    }
                }
            }
            //检查附件数量
            if (parseInt(MaxCount) > 0) {
                var currentCount = $wrap.iAttFilesCount();
                if (currentCount + files.length > parseInt(MaxCount)) {
                    openAlert("您上传的附件数量超过了规定数量(" + MaxCount + "个)！");
                    return;
                }
            }

            if (ictr.iAttFileSelected($wrap, files) === false) return;

            if ($wrap.attr('IsCustomUpload') == 'true') {
                if (!_miss_fun._iAttURLData[$wrap.attr('id')]) _miss_fun._iAttURLData[$wrap.attr('id')] = [];

                for (var i = 0; i < files.length; i++) {
                    solveFileData(files[i])
                }

                ictr.iAttCustomSelected($wrap, _miss_fun._iAttURLData[$wrap.attr('id')], function () { $wrap.iAttLoadList(); });
                return;
            }

            function solveFileData(file) {
                if ($wrap.attr('showasimgs') === 'true') {
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function (e) {
                        var fname = file.name.replace(/&/g, "").replace(/</g, "").replace(/>/g, "").replace(/ /g, "").replace(/\'/g, "").replace(/\"/g, "").replace(/\\/g, "").replace(/\//g, "");
                        _miss_fun._iAttURLData[$wrap.attr('id')].push({ name: fname, size: file.size, file: file, data: e.target.result });
                        $wrap.iAttLoadList();
                    };
                }
                else {
                    var fname = file.name.replace(/&/g, "").replace(/</g, "").replace(/>/g, "").replace(/ /g, "").replace(/\'/g, "").replace(/\"/g, "").replace(/\\/g, "").replace(/\//g, "");
                    _miss_fun._iAttURLData[$wrap.attr('id')].push({ name: fname, size: file.size, file: file, data: '' });
                }
            }

            for (i = 0; i < files.length; i++) {
                data.append("fileToUpload" + i, files[i]);
            }
        }

        var UploadFilter = $wrap.attr('UploadFilter') || '';
        if (UploadFilter) UploadFilter += '|' + svr._currentAssembly;

        data.append("ModuleKey", $wrap.attr('ModuleKey') || '');
        data.append("DocKey", $wrap.attr('dockey') || '');
        data.append("SubKey", $wrap.attr('subkey') || '');
        data.append("SubPath", $wrap.attr('subpath') || '');
        data.append("SavePath", $wrap.attr('savepath') || '');
        data.append("IsPathMode", $wrap.attr('ispathmode') || 'false');
        data.append("MaxImageSize", $wrap.attr('MaxImageSize') || '0');
        data.append("ImageToJpg", $wrap.attr('ImageToJpg') || 'false');
        data.append("UploadFilter", UploadFilter);

        var xhr = new XMLHttpRequest();
        /* event listners */
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/api/icontrols/UploadFileByHtml/UploadFile");
        iAttOnStart($wrap);
        xhr.send(data);

        function CustSendfiles(MethodName, Args) {//iAttSendFiles(自定义上传)
            iAttOnStart($wrap);

            var data1 = new FormData();

            //_miss_fun._iAttURLData[$wrap.attr('id')].push({ name: file.name, size: file.size, file:file,  data: file });
            var tempFiles = _miss_fun._iAttURLData[$wrap.attr('id')];
            for (i = 0; i < tempFiles.length; i++) {
                data1.append("fileToUpload" + i, tempFiles[i].file);
            }

            data1.append("MethodName", MethodName);
            data1.append("Controller", svr._currentAssembly);
            data1.append("Args", Args || '');

            var xhr = new XMLHttpRequest();
            /* event listners */
            xhr.upload.addEventListener("progress", uploadProgress, false);
            xhr.addEventListener("load", uploadComplete, false);
            xhr.addEventListener("error", uploadFailed, false);
            xhr.addEventListener("abort", uploadCanceled, false);
            xhr.open("POST", "/api/icontrols/UploadFileByHtml/UploadFileToBytes");
            xhr.send(data1);
        }

        //------------------------------------------------------------

        function uploadProgress(evt) {
            if (evt.lengthComputable) {
                iAttOnProgress($wrap, evt.loaded, evt.total, '');
            }
        }

        function uploadComplete(evt) {
            iAttOnComplete($wrap, "0");
            var ret = evt.target.responseText;
            if (_callback) _callback(ret);
        }

        function uploadFailed(evt) {
            iAttOnComplete($wrap, "上传失败，请重试！");
            if (_callback) _callback("error:上传失败");
        }

        function uploadCanceled(evt) {
            iAttOnComplete($wrap, "上传已经被取消！");
            if (_callback) _callback("error:上传已经被取消");
        }
        //============================================================
        function iAttOnStart($wrap) {
            iAttIsUploading = true;
        }
        function iAttOnComplete($wrap, isSuccess) {
            $wrap.ProgressBar(false);

            if (isSuccess == "0") {
                $wrap.iAttLoadList();
                _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
            }
            else {
                openAlert(isSuccess);
            }
            obj.value = '';
            iAttIsUploading = false;
        }

        function iAttOnProgress($wrap, byteLoaded, byteTotal, stat) {
            var progress = ((byteLoaded / byteTotal) * 100).toFixed(1).toString() + '%';
            $wrap.ProgressBar(progress, true);
        }
    },

    iAttRunSelectFile: function ($wrap) {
        var MaxCount = $wrap.attr('MaxCount') || '0';

        //检查附件数量
        if (parseInt(MaxCount) > 0) {
            var currentCount = $wrap.iAttFilesCount();
            if (currentCount >= parseInt(MaxCount)) {
                openAlert("您上传的附件数量超过了规定数量(" + MaxCount + "个)！");
                return;
            }
        }
        if ($.browser.isApp || $.browser.isWx) {
            if (app && (app.ver || $wrap.attr('PhotoByCamera') === 'true')) {
                var appMothed = $wrap.attr('PhotoByCamera') === 'true' ? 'TakePhoto' : 'TakePickPhoto';
                var Cropping = $wrap.attr('PhotoCropping') || "false";
                var Watermark = $wrap.attr('PhotoWatermark') == 'true' ? true : false;
                var WatermarkTitle = $wrap.attr('PhotoWatermarkTitle') || "";
                var WatermarkContent = $wrap.attr('PhotoWatermarkContent') || "";
                var PhotoSize = $wrap.attr('PhotoSize') || "800";

                var arg = { Cropping: Cropping, Watermark: Watermark, WatermarkTitle: WatermarkTitle, WatermarkContent: WatermarkContent, PhotoSize: PhotoSize };

                arg["ModuleKey"] = $wrap.attr('ModuleKey') || '';
                arg["DocKey"] = $wrap.attr('dockey') || '';
                arg["SubKey"] = $wrap.attr('subkey') || '';
                arg["SubPath"] = $wrap.attr('subpath') || '';
                arg["SavePath"] = $wrap.attr('savepath') || '';
                arg["IsPathMode"] = $wrap.attr('ispathmode') || 'false';
                arg["MaxImageSize"] = $wrap.attr('MaxImageSize') || '0';
                arg["ImageToJpg"] = $wrap.attr('ImageToJpg') || 'false';
                var UploadFilter = $wrap.attr('UploadFilter') || '';
                if (UploadFilter) UploadFilter += '|' + svr._currentAssembly;
                arg["UploadFilter"] = UploadFilter;

                window.top.app.invoke(appMothed + ':' + $.toJsonString(arg), function (ret) {
                    closeLoading();
                    if (ret == 'uploaded') {
                        $wrap.iAttLoadList();
                        _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                        return;
                    }
                    if (isError(ret)) {
                        openAlert(ret);
                        return;
                    }
                    if (ret) _miss_fun.iAttFileSelected('takephoto', $wrap, ret);
                });
            }
            else {
                $wrap.find("input[type=file]").click();
            }
        }
        else {
            $wrap.find("input[type=file]").click();
        }
    },

    iGridViewTreeClick: function (objImg) {
        var $obj = $(objImg);
        if (($obj).length == 0) return;
        var $tr = $obj.parent().parent().parent();
        var $fOrdbody = $tr.parent().parent().parent();

        var $wrap = $fOrdbody.parent();
        var $dtr;
        var $ftr;

        var rowindex = $tr.parent().find('>tr').index($tr);
        var $tr1;
        var $obj1;
        if ($fOrdbody.hasClass('fdbody')) {
            $tr1 = $fOrdbody.parent().find('.dbody>.tbody>tbody>tr:eq(' + rowindex + ')');
            $dtr = $tr1;
            $ftr = $tr;
        } else {
            $tr1 = $fOrdbody.parent().find('.fdbody>.tbody>tbody>tr:eq(' + rowindex + ')');
            $dtr = $tr;
            $ftr = $tr1;
        }
        $obj1 = $tr1.find('#' + $obj.attr('id'));

        var isExpand;

        if ($obj.attr('isexpand') == null || $obj.attr('isexpand') == 'true') {
            $obj.attr('isexpand', 'false');
            $obj.attr('src', $obj.attr('src').replace('minus.gif', 'plus.gif'));
            var TK = $obj.attr('id').replace('_ex', '');
            $tr.attr('exp', 'false');
            $tr.parent().find(">tr[TK^='" + TK + "']:gt(0)").hide();
            //
            $obj1.attr('isexpand', 'false');
            $obj1.attr('src', $obj1.attr('src').replace('minus.gif', 'plus.gif'));
            $tr1.attr('exp', 'false');
            $tr1.parent().find(">tr[TK^='" + TK + "']:gt(0)").hide();

            isExpand = false;
        } else {
            $obj.attr('isexpand', 'true');
            $obj.attr('src', $obj.attr('src').replace('plus.gif', 'minus.gif'));
            $tr.attr('exp', 'true');
            iGridViewTreeClickChild($tr);
            //
            $obj1.attr('isexpand', 'true');
            $obj1.attr('src', $obj1.attr('src').replace('plus.gif', 'minus.gif'));
            $tr1.attr('exp', 'true');
            iGridViewTreeClickChild($tr1);
            isExpand = true
        }

        $.each(ictr._rundata_.igvTreeClick, function () { this($obj, $dtr, $ftr, isExpand, $wrap); });

        function iGridViewTreeClickChild($tr) {
            var tk = $tr.attr('tk');
            if ($tr.attr('exp') == null || $tr.attr('exp') == '' || $tr.attr('exp') == 'true') {
                var $child = $tr.parent().find(">tr[pk='" + tk + "']");
                $child.show();

                $tr.parent().find(">tr[pk='" + tk + "'][rt='true']").each(function () {
                    iGridViewTreeClickChild($(this));
                });
            }
        }
    },

    iTreeNodeLineClick: function (obj) {
        var $obj = $(obj);
        var $child = $obj.parent().parent().next();
        if (!$obj.attr('isexpand') || $obj.attr('isexpand') === 'true') {
            $obj.attr('isexpand', 'false');
            $obj.attr('src', $obj.attr('src').replace('minus.gif', 'plus.gif'));
            $child.hide(200);
            $obj.parent().find('>[expandsrc]').attr('src', $obj.parent().find('>[expandsrc]').attr('closesrc'));
        } else {
            $obj.attr('isexpand', 'true');
            $obj.attr('src', $obj.attr('src').replace('plus.gif', 'minus.gif'));
            $child.show(200);
            $obj.parent().find('>[expandsrc]').attr('src', $obj.parent().find('>[expandsrc]').attr('expandsrc'));
        }
    },

    iTreeNodeTitleSelected: function (obj) {
        var $obj = $(obj);
        var $tree = $obj.parentUntil(function (x) {
            return x.attr('ctrtype') == 'itree'
        });
        if ($tree.length == 0) throw '没找到ctrtype';

        $tree.find('.iTreeTitleDV').removeAttr('selected');
        $obj.attr("selected", true);

        var $node = $obj.parent().parent();
        $.each(ictr._rundata_.itreeNodeSelected, function () { this($node, $tree); });
    },

    iTreeNodeCheckBoxClick: function (obj) {

        var $chk = $(obj);
        if ($chk.attr('isdisabled') == 'true') return;

        var $node = $chk.parent().parent().parent();

        var $tree = $node.parentUntil(function (x) {
            return x.attr('ctrtype') == 'itree'
        });
        if ($tree.length == 0) throw '没找到ctrtype';

        var ischecked = $chk.attr("treechecked") === "true";

        var beforeRet = ictr.iTreeNodeBeforeChangeChecked($node, ischecked, $tree);
        if (beforeRet === false) return;
        if (!beforeRet || beforeRet === true) {
            runChange();
            return;
        }
        if (beforeRet.constructor === Function) {
            beforeRet(function () { runChange(); });
        }

        function runChange() {
            var val;
            var relaVal = [];
            if ($node.attr('keyvalue')) relaVal.push($node.attr('keyvalue'));
            if (ischecked) {
                $chk.attr("treechecked", "false");
                $chk.attr("src", $chk.attr("src").replace("_checkbox1.gif", "_checkbox0.gif").replace("_checkbox2.gif", "_checkbox0.gif"));
                val = false;
                if ($tree.attr('autocheckchildren') == 'true') {
                    var relas = _miss_fun.iTreeSetChildUnChecked($node);
                    for (var i = 0; i < relas.length; i++) {
                        if (relas[i] && relaVal.indexOf(relas[i]) < 0) relaVal.push(relas[i]);
                    }
                }
            }
            else {
                $chk.attr("treechecked", "true");
                $chk.attr("src", $chk.attr("src").replace("_checkbox0.gif", "_checkbox1.gif").replace("_checkbox2.gif", "_checkbox1.gif"));
                val = true;
                if ($tree.attr('autocheckchildren') == 'true') {
                    var relas = _miss_fun.iTreeSetChildChecked($node);
                    for (var i = 0; i < relas.length; i++) {
                        if (relas[i] && relaVal.indexOf(relas[i]) < 0) relaVal.push(relas[i]);
                    }
                }
                if ($tree.attr('autocheckparent') == 'true') {
                    var relas = _miss_fun.iTreeSetParentChecked($node);
                    for (var i = 0; i < relas.length; i++) {
                        if (relas[i] && relaVal.indexOf(relas[i]) < 0) relaVal.push(relas[i]);
                    }
                }
            }

            if ($tree.attr('resetcheck') == 'true') _miss_fun.iTreeSetParentCheckboxStatus($node, val);

            $.each(ictr._rundata_.itreeNodeCheckedChanged, function () { this($node, val, relaVal, $tree) });
        }
    },

    iTreeSetParentCheckboxStatus: function ($node, checked) {
        var $parentNode = $node.parent().parent();
        if (!$parentNode.attr('fullkey')) return;
        var $chk = $parentNode.find('>.iTreeItem>.iTreeLinesDV>img[treechecked]')

        var hasTrue = false;
        var hasFalse = false;
        $parentNode.find('>.iTreeChild').find('img[treechecked]').each(function () {
            var checked = $(this).attr('treechecked');
            if (checked == 'true')
                hasTrue = true;
            else
                hasFalse = true;
        });
        if (hasTrue && hasFalse) //semi-checked
        {
            $chk.attr("treechecked", "true")
                .attr("src", $chk.attr("src").replace("_checkbox0.gif", "_checkbox2.gif").replace("_checkbox1.gif", "_checkbox2.gif"));
        }
        else if (hasTrue && !hasFalse) //all-checked
        {
            $chk.attr("treechecked", "true")
                .attr("src", $chk.attr("src").replace("_checkbox0.gif", "_checkbox1.gif").replace("_checkbox2.gif", "_checkbox1.gif"));
        }
        else //all-unchecked
        {
            $chk.attr("treechecked", "false")
                .attr("src", $chk.attr("src").replace("_checkbox1.gif", "_checkbox0.gif").replace("_checkbox2.gif", "_checkbox0.gif"));
        }

        return _miss_fun.iTreeSetParentCheckboxStatus($parentNode, checked);
    },

    iTreeResetCheckboxStatus: function ($tree) {
        var parents = [];
        $tree.find('div[fullkey]').each(function () {
            var $node = $(this);
            if ($node.find('>.iTreeChild img[treechecked]:first').length == 0) {
                var fk = $node.parent().parent().attr('fullkey');
                if (!fk || parents.indexOf(fk) >= 0) return true;
                parents.push(fk);
                var $chk = $node.find('>.iTreeItem>.iTreeLinesDV>img[treechecked]')
                _miss_fun.iTreeSetParentCheckboxStatus($node, $chk.attr('treechecked') == 'true');
            }
        });
    },

    iTreeDisableParentCheckbox: function ($tree) {
        $tree.find('div[fullkey]').each(function () {
            var $node = $(this);
            if ($node.find('>.iTreeChild img[treechecked]:first').length > 0) {
                $node.find('>.iTreeItem>.iTreeLinesDV>img[treechecked]').attr('isdisabled', 'true');
            }
        });
    },

    iTreeSetChildUnChecked: function ($node) {
        var valList = [];
        $node.find('>.iTreeChild img[treechecked="true"]').each(function () {
            var $chk = $(this);
            $chk.attr("treechecked", "false");
            $chk.attr("src", $chk.attr("src").replace("_checkbox1.gif", "_checkbox0.gif").replace("_checkbox2.gif", "_checkbox0.gif"));
            var keyvalue = $chk.parent().parent().parent().attr('keyvalue');
            if (keyvalue && valList.indexOf(keyvalue) < 0) valList.push(keyvalue);
        });
        return valList;
    },

    iTreeSetChildChecked: function ($node) {
        var valList = [];
        $node.find('>.iTreeChild img[treechecked="false"]').each(function () {
            var $chk = $(this);
            $chk.attr("treechecked", "true");
            $chk.attr("src", $chk.attr("src").replace("_checkbox0.gif", "_checkbox1.gif").replace("_checkbox2.gif", "_checkbox1.gif"));
            var keyvalue = $chk.parent().parent().parent().attr('keyvalue');
            if (keyvalue && valList.indexOf(keyvalue) < 0) valList.push(keyvalue);
        });
        return valList;
    },

    iTreeSetParentChecked: function ($node) {
        var valList = arguments[1] || [];
        var $parentNode = $node.parent().parent();
        if (!$parentNode.attr('fullkey')) return valList;
        var $chk = $parentNode.find('>.iTreeItem>.iTreeLinesDV>img[treechecked]')
        if ($chk.length > 0) {
            if ($chk.attr('treechecked') == 'false') {
                //设为选中状态
                $chk.attr("treechecked", "true");
                $chk.attr("src", $chk.attr("src").replace("_checkbox0.gif", "_checkbox1.gif"));
                var keyvalue = $parentNode.attr('keyvalue');
                if (keyvalue && valList.indexOf(keyvalue) < 0) valList.push(keyvalue);
            }
        }
        return _miss_fun.iTreeSetParentChecked($parentNode, valList);
    },

    isActiveEle: function ($actEl, pickerID) {
        return $actEl.parentUntil(function ($t) { return $t.attr('ID') === pickerID }, 7).length > 0;
    },

    _iGridViewlineMove: false,
    _iGridViewcurrTh: null,

    _iGridViewTDEdit_CurrentTD: null,
    _iGridViewTDEdit_Columns: {},

    _iReferenceCache: {},

    iGridViewOptimizeWidth: function ($igrid) {
        var $dbody = $igrid.find('.dbody');
        var $tbody = $dbody.find('>table');

        var dbody_width = $dbody.outerWidth();
        var tbody_width = $tbody.outerWidth();
        var addwidth = dbody_width - tbody_width;
        if (Math.abs(addwidth) < 42) {
            if (!$.browser.msie) addwidth -= $dbody.ScrollBarWidth('v');
            var col = $tbody.find('>colgroup>col:last');
            var oldwidth = col.width();
            var width = oldwidth + addwidth - 1;
            if (width < 0) width = oldwidth;
            col.attr('width', width + 'px');
            $igrid.find('.dhead>table>colgroup>col:last').attr('width', width + 'px');
            $igrid.find('.dsum>table>colgroup>col:last').attr('width', width + 'px');
        }
    },

    iGridViewEditCtr: function (joArgs) {
        var ctrDiv;
        if (joArgs.CtrType === "iTextString") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextAlign = joArgs.TextAlign;
        } else if (joArgs.CtrType === "iTextDecimal") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "Decimal";
            ctrDiv.TextAlign = joArgs.TextAlign;
        } else if (joArgs.CtrType === "iTextPercent") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "Percent";
            ctrDiv.TextAlign = joArgs.TextAlign;
            ctrDiv.PercentMin = joArgs.PercentMin;
            ctrDiv.FormatStr = joArgs.FormatStr;
        } else if (joArgs.CtrType === "iTextInteger") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "Integer";
            ctrDiv.TextAlign = joArgs.TextAlign;
        } else if (joArgs.CtrType === "iTextDate") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "Date";
            ctrDiv.TextAlign = joArgs.TextAlign;
            ctrDiv.FormatStr = joArgs.FormatStr;
        } else if (joArgs.CtrType === "iTextDateTime") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "DateTime";
            ctrDiv.TextAlign = joArgs.TextAlign;
            ctrDiv.MinuteStep = joArgs.MinuteStep;
            ctrDiv.FormatStr = joArgs.FormatStr;
        } else if (joArgs.CtrType === "iTextTime") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "Time";
            ctrDiv.TextAlign = joArgs.TextAlign;
            ctrDiv.MinuteStep = joArgs.MinuteStep;
            ctrDiv.FormatStr = joArgs.FormatStr;
        } else if (joArgs.CtrType === "iTextPeriod") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "Period";
            ctrDiv.TextAlign = joArgs.TextAlign;
        } else if (joArgs.CtrType === "iTextArea") {
            ctrDiv = new ictr.iText();
            ctrDiv.TextType = "TextArea";
            ctrDiv.TextAlign = joArgs.TextAlign;
        } else if (joArgs.CtrType === "iSelect") {
            ctrDiv = new ictr.iSelect();
            ctrDiv.isSync = true;
            ctrDiv.UserValue = joArgs.UserValue;
            ctrDiv.ShowType = joArgs.ShowType;
            ctrDiv.ShowCode = joArgs.iSelShowCode || false;
            ctrDiv.MultiSelect = joArgs.MultiSelect;
            ctrDiv.AddEmpty = joArgs.iSelAddEmpty;
            if (joArgs.iSelectDS) {
                ctrDiv.ClientDS = JSON.stringify(joArgs.iSelectDS);
            } else {
                ctrDiv.EntityName = joArgs.EntityName;
                ctrDiv.DFilterValue = joArgs.DFilterValue;
                ctrDiv.DFilterJson = joArgs.DFilterJson;
                ctrDiv.DTableValue = joArgs.DTableValue;
                ctrDiv.CheckAuthority = joArgs.CheckAuthority;
                ctrDiv.KeyField = joArgs.KeyField;
                ctrDiv.sql = joArgs.sql;
                ctrDiv.oql = joArgs.oql;
            }
            ctrDiv.ExtDS = joArgs.ExtDS;
            ctrDiv.ExcludeKeys = joArgs.ExcludeKeys;
            ctrDiv.FilterKeys = joArgs.FilterKeys;
        } else if (joArgs.CtrType === "iReference") {
            ctrDiv = new ictr.iReference();
            ctrDiv.isSync = true;
            ctrDiv.UserValue = joArgs.UserValue;
            ctrDiv.KeepBuffer = joArgs.KeepBuffer; //是否缓存参照列表数据
            ctrDiv.EntityName = joArgs.EntityName;
            ctrDiv.DFilterValue = joArgs.DFilterValue;
            ctrDiv.DFilterJson = joArgs.DFilterJson;
            ctrDiv.DTableValue = joArgs.DTableValue;
            ctrDiv.CheckAuthority = joArgs.CheckAuthority;
            ctrDiv.Url = joArgs.iRefUrl;
            ctrDiv.CanInput = joArgs.iRefCanInput;
            ctrDiv.ShowType = joArgs.ShowType;
            ctrDiv.FieldsList = joArgs.iRefFieldsList;
            ctrDiv.KeyField = joArgs.KeyField;
            ctrDiv.sql = joArgs.sql;
            ctrDiv.oql = joArgs.oql;
            ctrDiv.MultiSelect = joArgs.MultiSelect;
            ctrDiv.ExtDS = joArgs.ExtDS;
            ctrDiv.ExcludeKeys = joArgs.ExcludeKeys;
            ctrDiv.FilterKeys = joArgs.FilterKeys;
            if (joArgs.DefaultValue) ctrDiv.Key = joArgs.DefaultValue;
        } else if (joArgs.CtrType === "iCheckBox") {
            ctrDiv = new ictr.iCheckBox();
        }
        else {
            ctrDiv = new ictr.iText();
            ctrDiv.TextAlign = joArgs.TextAlign;
        }

        if (joArgs.DefaultValue && joArgs.CtrType && joArgs.CtrType != 'iReference') ctrDiv.Value = joArgs.DefaultValue;

        return ctrDiv
    },

    iGridViewTDEdit: function (ctrID, EditArgs) {

        /*
        var joColumn = {
            columnName,
            CtrType,
            EntityName,
            DFilterValue,
            DFilterJson,
            DTableValue,
            CheckAuthority,
            KeyField,
            ShowField,
            ShowType,
            DefaultValue,
            iRefFieldsList,
            iRefCanInput,
            UserValue,
            iSelShowCode,
            MultiSelect,
            ExtDS,
            ExcludeKeys,
            FilterKeys,
            iSelectDS,
            iSelAddEmpty,
            FormatStr,
            PercentMin,
            MinuteStep,
            TextAlign,
            KeepBuffer,
            iRefUrl,
            sql,
            oql
        }
        */
        var joArgs = $.JsonObject(EditArgs);

        var $wrap = $('#' + ctrID);
        var $table = $wrap.find(".dbody>.tbody");
        //查找columnName是第几列
        var $colgroup = $table.find(">colgroup");

        var cIndex = -1;

        $colgroup.find("col").each(function (ci) {
            if ($(this).attr('columnname') == joArgs.columnName) cIndex = ci;
        });

        if (cIndex == -1) {
            console.log('edit column name does not exists: ' + joArgs.columnName);
            return;
        }

        if (_miss_fun._iGridViewTDEdit_Columns['A' + ctrID] === undefined) _miss_fun._iGridViewTDEdit_Columns['A' + ctrID] = [];

        var isAddedToArray = false;
        for (var i = 0; i < _miss_fun._iGridViewTDEdit_Columns['A' + ctrID].length; i++) {
            if (_miss_fun._iGridViewTDEdit_Columns['A' + ctrID][i].columnName == joArgs.columnName) {
                isAddedToArray = true;
                break;
            }
        }
        if (!isAddedToArray) _miss_fun._iGridViewTDEdit_Columns['A' + ctrID].push(joArgs);

        $table.find('>tbody>tr').each(function () {
            var $tr = $(this);
            var $editTd = $tr.find('>td[i="' + cIndex + '"]');

            if ($editTd.attr('_isbindeditevent')) return true;
            $editTd.attr('_isbindeditevent', 'true');

            if (!$editTd.attr('isedit')) $editTd.attr('isedit', 'true');
            $editTd.off('click').on('click', function (evt) {
                $editTd.attr('isediting', 'false');
                if ($editTd.attr('isedit') !== 'true') return;

                if (window._isOpening_iRefForm) return; //当前有参照弹出框
                if ($wrap.attr('editmode') === 'none') return;
                var $td = $(this);

                if (_miss_fun._iGridViewTDEdit_CurrentTD == $td[0]) {
                    if (joArgs.CtrType === "iCheckBox") {
                        var $chkbox = $td.find('input[type="checkbox"]');
                        if ($chkbox.length === 1 && $chkbox.prop('disabled') === false && evt.target !== $chkbox[0]) {
                            $chkbox.click();
                        }
                    }
                    return;
                }
                _miss_fun._iGridViewTDEdit_CurrentTD = $td[0];

                //生成iControlDIV====================================
                var ctrDiv = _miss_fun.iGridViewEditCtr(joArgs);
                var ctrDivID = "iEditCtrl_" + joArgs.columnName;

                //iGridViewInitEditCtrl事件
                var ctrObj = { ctr: ctrDiv, type: joArgs.CtrType };
                var isCancel = false;
                $.each(ictr._rundata_.igvInitEditCtrl, function () { if (this(joArgs.columnName, $td, ctrObj, $wrap) === false) isCancel = true; });
                if (isCancel) {
                    _miss_fun._iGridViewTDEdit_CurrentTD = null;
                    return;
                }
                ctrObj.ctr.id = ctrDivID;
                $editTd.attr('isediting', 'true');

                _miss_fun.iGridViewTDEditEvent(ctrObj.ctr, $td, joArgs.columnName, joArgs.ShowField, $wrap, null);

                //第一列，绑定Paste事件，用于导入粘贴板数据
                if (_miss_fun._iGridViewTDEdit_Columns['A' + ctrID][0].columnName == joArgs.columnName) {
                    $('#' + ctrDivID).find('input[type=text]').on({
                        paste: function (e) {
                            var clipboardData = window.clipboardData || e.originalEvent.clipboardData
                            var pasteData = clipboardData.getData('Text') || '';
                            if (pasteData && pasteData.indexOf('\t') > 0 || pasteData.indexOf('\n') > 0) {
                                $('#' + ctrID).iGridViewBatchImport(pasteData);
                            }
                        }
                    });
                }
            })
                .off('keydown').on('keydown', function (event) {
                    event = event || window.event;

                    if (event.keyCode !== 13 && event.keyCode !== 9) return; //13:回车,9:Tab

                    var $td = $(this);
                    if ($td.find('>div[texttype="textarea"]').length > 0) return;

                    var $wrapCtr = $td.find(">div");
                    if ($wrapCtr.attr('ctrtype') == 'iSelect') {
                        var $input = $wrapCtr.find('>.ictr-input');
                        var childpickerID = $input.attr('childpickerID');
                        var childpicker = $('#' + childpickerID);
                        var currentindex = childpicker.find('table tr').index(childpicker.find('table tr.chosen'));
                        if (currentindex === -1) currentindex = 0;
                        var tr = childpicker.find('table tr:eq(' + currentindex + ')');
                        if (tr.length > 0) {
                            tr.click();
                        }
                        else if ($wrapCtr.attr('uservalue') === 'true' && $input.val()) {
                            var el = $input.val();
                            $wrapCtr.attr('key', el).attr('code', el).attr('desc', el);
                            childpicker.remove();
                        }
                    }

                    $("body").mousedown();
                    if ($wrapCtr.length > 0 && $wrapCtr.attr('openingForm') === 'true') return false;

                    //查找columnName是第几列
                    var EditColumns = $table.attr('ecl');

                    var $colgroup = $table.find(">colgroup");
                    var $currtr = $tr;
                    var currIdx = cIndex;
                    var cNextIndex = -1;
                    var $edittd = null;

                    while (true) {
                        cNextIndex = -1;
                        $colgroup.find('col:gt(' + currIdx + ')').each(function (ci) {
                            if (EditColumns.indexOf(',' + $(this).attr('columnname') + ',') >= 0 && cNextIndex === -1) cNextIndex = ci + currIdx + 1;
                        });

                        if (cNextIndex == -1) {
                            $colgroup.find('col').each(function (ci) {
                                if (EditColumns.indexOf(',' + $(this).attr('columnname') + ',') >= 0 && cNextIndex === -1) cNextIndex = ci;
                            });
                            if (cNextIndex != -1) {
                                $currtr = $currtr.next().eq(0);
                                $edittd = $currtr.find(">td[i='" + cNextIndex + "']").click();
                            }
                        } else {
                            $edittd = $currtr.find(">td[i='" + cNextIndex + "']").click();
                        }

                        if (!$edittd || $edittd.length == 0 || $edittd.attr('isediting') == 'true') return false;
                        currIdx = cNextIndex;
                    }
                    return false;
                });
        });
    },

    iGridViewTDEditEvent: function (ctrDiv, $td, colName, tdShowField, $wrap, $div) {

        var $editContainer = $div || $td;

        if (ctrDiv.CtrType === "iCheckBox") $editContainer.css({ 'text-align': 'center' });
        if ($div)
            $div.css({ 'padding': '0px', 'border': '0px' });
        else
            $editContainer.attr('_rawpadding', $editContainer.css('padding')).css({ 'padding': '0px 1px' });

        ctrDiv.style = 'float:left;';
        ctrDiv.Width = $editContainer.width();

        //var oldHtml = $.trim($td.text());
        //if (oldHtml === "&nbsp;") oldHtml = "";

        var oldHtml = $.trim(DecodeHtml($td.html().replace(/\<br\>/g, '\n')));
        var rawValue = $td.attr("_rawValue") || '';

        $editContainer.html(ctrDiv.GetHtml()).attr('_beforeedithtml', oldHtml).attr('_beforeeditvalue', rawValue);
        var $ctrDiv = $('#' + ctrDiv.id);
        $ctrDiv.iControls();

        if (ctrDiv.CtrType === 'iText') {
            if (oldHtml) $ctrDiv.ival(oldHtml);
        } else if (ctrDiv.CtrType === 'iSelect') {
            var divValue = rawValue || oldHtml;
            if (divValue) $ctrDiv.ival(divValue);
        } else if (ctrDiv.CtrType === 'iReference') {
            var divValue = rawValue || oldHtml;
            if (divValue) $ctrDiv.ival(divValue);
        } else if (ctrDiv.CtrType === 'iCheckBox') {
            $ctrDiv.css({ "float": "none", "height": "16px", "padding-top": "2px", "margin-bottom": "0px", "text-align": "center" });
            var checkboxValue = "0";
            if (oldHtml === "√" || oldHtml.toLowerCase() === "true" || oldHtml.toLowerCase() === "yes" || oldHtml.toLowerCase() === "1" || oldHtml === "是") {
                checkboxValue = "1";
            }
            $ctrDiv.ival(checkboxValue);
        }
        setTimeout(function () { try { $ctrDiv.find('input').focus(); } catch (e) { } }, 0);

        //===================================================================================
        $("body").off('mousedown').on('mousedown', function (event) {
            if (_miss_fun._iGridViewTDEdit_CurrentTD == null) return;
            var $ctr = $editContainer.find(">[bindfield]");
            if ($ctr.length === 0) return;
            event = event || window.event;
            var srcEle = event.srcElement ? event.srcElement : event.target;
            var $srcEle = $(srcEle);

            if ($srcEle.parentUntil(function ($t) { return $t[0] === _miss_fun._iGridViewTDEdit_CurrentTD }, 8).length > 0
                || $srcEle.parentUntil(function ($t) { return $t.attr('pickertype') }, 8).length > 0)
                return;

            if (ctrDiv.CtrType === 'iReference') {
                if ($ctr.attr('isSettedValue')) {
                    $ctr.removeAttr('isSettedValue');
                }
                else {
                    $ctr.iReferenceSetValue($ctr.find(">input").val(), '#code#', !$wrap.attr('isImporting'));
                    if ($ctr.attr('openingForm') === 'true') return;
                }
            }

            //记录点击控件，以便立即显示
            var clickcolname = $srcEle.attr('colName');
            if (clickcolname && $srcEle.hasClass('ictr-input')) {
                var $clickrow = $srcEle.parentUntil(function (x) { return x.attr('igvrowidx'); });
                if ($clickrow.length > 0) {
                    var clickrowidx = $clickrow.attr('igvrowidx');
                    var $ptn = $clickrow.parentUntil(function (x) { return x.attr('ctrtype') == 'iGridViewPartner'; });
                }
            }

            if ($ctr.attr('texttype') === 'percent') _miss_fun.iTextValidatePercent($ctr.find('input')[0]);

            //联动脚本=======iGridViewModified事件
            $.each(ictr._rundata_.igvModified, function () { this(colName, $td, $ctr, $wrap); });

            //将值写到TD
            var newHtml = "&nbsp;";
            if (ctrDiv.CtrType == 'iText') {
                newHtml = $ctr.ival();
                if (ctrDiv.TextType == "TextArea") {
                    newHtml = newHtml.replace(/[\n|\r]/g, '<br>').replace(/[ |\t]/g, '&nbsp;');
                }
            } else if (ctrDiv.CtrType == 'iSelect') {
                if ($ctr.attr('uservalue') === 'true') $ctr.attr('key', $ctr.find('input').val());
                if (!tdShowField) {
                    newHtml = $ctr.ival() || '';
                }
                else if (tdShowField.toLowerCase() == "#desc#") {
                    $td.attr('_rawValue', $ctr.ival());
                    newHtml = $ctr.attr('desc') || '';
                }
                else if (tdShowField.toLowerCase() == "#code#") {
                    $td.attr('_rawValue', $ctr.ival());
                    newHtml = $ctr.attr('code') || '';
                }
            }
            else if (ctrDiv.CtrType === 'iReference') {
                if (!tdShowField) {
                    newHtml = $ctr.ival() || '';
                }
                else if (tdShowField.toLowerCase() === "#desc#") {
                    $td.attr('_rawValue', $ctr.ival());
                    newHtml = $ctr.attr('desc');
                }
                else if (tdShowField.toLowerCase() === "#code#") {
                    $td.attr('_rawValue', $ctr.ival());
                    newHtml = $ctr.attr('code');
                }
                else {
                    $td.attr('_rawValue', $ctr.ival());
                    newHtml = $ctr.iReferenceJson(tdShowField);
                }
            }
            else if (ctrDiv.CtrType === 'iCheckBox') {
                newHtml = $ctr.ival() === true ? "√" : "";
            }
            else {
                newHtml = $ctr.ival();
            }
            if (newHtml === "") newHtml = "&nbsp;";

            var childpickerID = $ctr.attr('childpickerID') || $ctr.find('>input').attr('childpickerID');
            if (childpickerID) {
                $ctr.removeAttr('childpickerID');
                $ctr.find('>input').removeAttr('childpickerID');
                $($ctr[0].ownerDocument).find('#' + childpickerID).remove();
            }

            $td.html(newHtml).css({ 'padding': $td.attr('_rawpadding') });

            if (!$td.attr('title') || $td.attr('title').indexOf($.trim($td.text() || '')) < 0) $td.attr('title', $td.text());

            _miss_fun._iGridViewTDEdit_CurrentTD = null;

            //iGridViewAfterModified事件
            $.each(ictr._rundata_.igvAfterModified, function () { this(colName, $td, $wrap); });

            //重新计算合计行
            if (colName) _miss_fun.iGridViewCalcSumRow($wrap, $td.parent().parent().parent());

            //iGridView-Partner
            if (colName) _miss_fun.iGridViewBuildPartner($wrap, null, $td.parent());

            //保存编辑到服务端
            _miss_fun.iGridViewSaveEditData(colName, $td, $wrap);

            //点击一下最后点击的编辑框
            if ($ptn) {
                setTimeout(function () {
                    $ptn.find('.row[igvrowidx="' + clickrowidx + '"]').find('input[colName="' + clickcolname + '"]').click();
                }, 0);
            }

            $("body").off('mousedown');
        });
    },

    iGridViewSaveEditData: function (colName, $td, $wrap) {
        if ($wrap.attr('saveedit') !== 'true') return;

        var GridArgs = {};
        var $tr = $td.parent();
        GridArgs.seqkey = $tr.attr('_seqkey');
        GridArgs.GridKey = $wrap.iGridViewGetGridKey();
        GridArgs.ctrID = $wrap.attr('ID');
        GridArgs.action = svr._currentAssembly;
        GridArgs.actType = "modify";
        GridArgs.colName = colName;
        GridArgs.CacheType = $wrap.attr('cachetype');

        GridArgs.data = {};
        GridArgs.data["_keyvalue"] = $tr.attr('keyValue') || '';
        GridArgs.data["_extvalue"] = $tr.attr('extValue') || '';
        $tr.parent().parent().find(">colgroup").find("col").each(function (colindex) {
            var cn = $(this).attr('columnname');
            if (cn) {
                var $cell = $tr.find(">td[i='" + colindex + "']");

                if ($cell.length === 0) {
                    var $tr1 = $tr;
                    while ($cell.length === 0) {
                        $tr1 = $tr1.prev();
                        if ($tr1.length == 0) break;
                        $cell = $tr1.find(">td[i='" + colindex + "']");
                    }
                }

                if ($cell.length === 1) {
                    var tdVal = '';

                    if ($cell.attr('value-as-html'))
                        tdVal = $.trim($cell.html());
                    else
                        tdVal = $.trim($cell.text());

                    if (!tdVal) {
                        var $ctr = $cell.find('>div');
                        if ($ctr.length > 0) {
                            tdVal = $ctr.ival();
                        }
                        else {
                            var $ctr = $cell.find('>input');
                            if ($ctr.length > 0) {
                                tdVal = $ctr.ival();
                            }
                        }
                    }

                    GridArgs.data[cn] = tdVal;

                    if ($(this).attr('hasraw')) {
                        GridArgs.data[cn + '_rawValue'] = $.trim($cell.attr('_rawValue') || '');
                    }
                }
                else {
                    GridArgs.data[cn] = '';
                }
            }
        });

        var url = "/api/icontrols/iGridViewData/SaveEditData";
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            timeout: 7200000,
            url: url,
            data: { GridArgs: $.toJsonString(GridArgs) }
        }).done(function (ret) {
            if (!GridArgs.seqkey) $tr.attr('_seqkey', ret);
        });
    },

    iGridViewCalcSumRow: function ($wrap, $table) {
        var $tsum = $wrap.find('>.dsum>.tsum');
        if ($tsum.legnth == 0) return;

        var cols = $.JsonObject($wrap.attr('columns'))
        for (var i = 0; i < cols.length; i++) {
            var c = cols[i];
            if (c.SumStatus && c.SumStatus !== 'none' && c.SumStatus !== 'percent') {
                var calc = getColSum(i + ($wrap.attr('rowhead') == 'none' ? 0 : 1), c.SumStatus);
                $tsum.find('>tbody>tr>td[columnname="' + c.FieldName + '"]').html(calc);
            }
        }

        function getColSum(colindex, SumStatus) {
            if (!$table) $table = $wrap.find('>.dbody>.tbody');
            var sum = 0;
            var max = -999999;
            var min = 9999999;
            var count = 0;
            var val;
            $table.find(">tbody>tr").each(function () {
                $tr = $(this);

                if ($tr.attr('rt') !== "true") {
                    var $td = $tr.find(">td[i='" + colindex + "']");
                    if ($td.length === 1) {
                        var tdVal = '';
                        var $ctr = $td.find('>div');
                        if ($ctr.length == 0) {
                            tdVal = $.trim($td.text());
                        }
                        else {
                            tdVal = $ctr.ival();
                        }
                        val = parseFloat(tdVal.replace(/,/g, '')) || 0;
                        if (tdVal) {
                            sum += val;
                            count++;
                            if (max < val) max = val;
                            if (min > val) min = val;
                        }
                    }
                }
            });
            var avg = count === 0 ? 0 : (sum / count);
            switch (SumStatus) {
                case "sum": return $.FormatNumber(sum, 2);
                case "max": return $.FormatNumber(max, 2);
                case "min": return $.FormatNumber(min, 2);
                case "count": return $.FormatNumber(count, 0);
                case "avg": return $.FormatNumber(avg, 2);
            }
            return "";
        }
    },

    iGridViewBuildPartner: function ($igv, partnerID, $actTr) {

        if (!partnerID) partnerID = $igv.attr('partner');
        if (!partnerID) return;

        var pp = partnerID.split(',');
        if (pp.length > 1) {
            for (var i = 0; i < pp.length; i++) {
                _miss_fun.iGridViewBuildPartner($igv, $.trim(pp[i]));
            }
            return;
        }

        var $partner = $('#' + partnerID);
        if ($partner.length === 0) return;

        var isSingle = $partner.attr('isSingle') === 'true';
        $partner.attr('igvID', $igv.attr('id'));
        buildPartnerFields();
        var fields = $partner.attr('fields').split(',');

        var $alltrs = $igv.find(">.dbody>.tbody>tbody>tr");

        var $container = $partner.find('>.iGridViewPartner-container');

        if (isSingle) {
            $container.empty();
            var $tr = $igv.iGridViewActiveRow();
            var currentrow = parseInt($alltrs.index($tr)) + 1;
            var totalrow = $alltrs.length;

            $('#' + partnerID + '_currentrow').text(currentrow);
            $('#' + partnerID + '_totalrow').text(totalrow);

            var isV = $partner.find('>.iGridViewPartner-container').hasClass('container-v');
            var $row = $('<div class="row" igvrowidx="' + idx + '" style="margin-bottom:4px;"></div>');

            for (var i = 0; i < fields.length; i++) {
                var columnName = $.trim(fields[i]);
                if ($tr.findTD(columnName).attr('_isPartnerVisible') == "false") continue;
                var $html = buildItem($tr, columnName);
                if (isV)
                    $container.append($html);
                else
                    $row.append($("<div class='col-sm-12'></div>").append($html));
            }
            if (!isV) $container.append($row);
        }
        else {
            if ($actTr && $partner.attr('isloaded') == 'true') {
                var idx = parseInt($alltrs.index($actTr));
                var $row = $container.find('[igvrowidx="' + idx + '"]').empty();

                for (var i = 0; i < fields.length; i++) {
                    var columnName = $.trim(fields[i]);
                    if ($actTr.findTD(columnName).attr('_isPartnerVisible') == "false") continue;
                    var $html = buildItem($actTr, columnName);
                    if ($html && idx % 2 == 0) $html.css('background-color', 'cornsilk').find('*').css('background-color', 'cornsilk');
                    $html = $("<div class='col-sm-12'></div>").append($html);
                    $row.append($html);
                }
            }
            else {
                $container.empty();
                $alltrs.each(function (idx) {
                    var $row = $('<div class="row" igvrowidx="' + idx + '" style="margin-bottom:4px;"></div>');
                    var $tr = $(this);
                    for (var i = 0; i < fields.length; i++) {
                        var columnName = $.trim(fields[i]);
                        if ($tr.findTD(columnName).attr('_isPartnerVisible') == "false") continue;
                        var $html = buildItem($tr, columnName);
                        if ($html && idx % 2 == 0) $html.css('background-color', 'cornsilk').find('*').css('background-color', 'cornsilk');
                        $html = $("<div class='col-sm-12'></div>").append($html);
                        $row.append($html);
                    }
                    $container.append($row);
                });
                $partner.attr('isloaded', true);
            }
        }

        function buildItem($tr, columnName) {
            columnName = columnName.replace('.', '_');
            var $td = $tr.findTD(columnName);
            var align = $td.css('text-align');
            var ret = getItemInfo(columnName);
            if (!ret.col) return '';

            var val;
            var $editctr = $td.find('>[bindfield]');
            if ($editctr.length === 0)
                val = $td.text();
            else
                val = $editctr.ival();

            var html = '<div class="iItem-wrap" ctrtype="iitem">' +
                '<div class="iItem-Container">' +
                '<div class="iItem-Title" title="' + ret.col.HeadHint + '">' + ret.col.HeadTitle + '</div>' +
                '<div class="iItem-Content">' +

                '<div class="ictr-wrap rounded" ctrtype="iText" texttype="string" style="width:100%;border:1px solid transparent; box-shadow:none;">' +
                '<input type="text" colName="' + columnName + '" class="ictr-input" autocomplete="off" value="' + EncodeHtml(val) + '" readonly="readonly" style="text-overflow:ellipsis;text-align:' + align + ';" />' +
                '</div>' +

                '</div></div></div>';

            var $html = $(html);
            if (ret.editarg) {
                var $div = $html.find('div[ctrtype="iText"]');
                var joArgs = ret.editarg;
                $div.attr('isedit', 'true').attr('editctrtype', joArgs.CtrType).off('click').on('click', function (evt) {
                    if (window._isOpening_iRefForm) return; //当前有参照弹出框
                    if ($igv.attr('editmode') === 'none') return;
                    if ($tr.length === 0) return;
                    var $td = $tr.findTD(joArgs.columnName);

                    if (_miss_fun._iGridViewTDEdit_CurrentTD == $div[0]) {
                        if (joArgs.CtrType === "iCheckBox") {
                            var $chkbox = $td.find('input[type="checkbox"]');
                            if ($chkbox.length === 1 && $chkbox.prop('disabled') === false && evt.target !== $chkbox[0]) {
                                $chkbox.click();
                            }
                        }
                        return;
                    }
                    _miss_fun._iGridViewTDEdit_CurrentTD = $div[0];

                    //生成iControlDIV====================================
                    var ctrDiv = _miss_fun.iGridViewEditCtr(joArgs);
                    var ctrDivID = "iEditCtrl_" + joArgs.columnName;

                    //iGridViewInitEditCtrl事件
                    var ctrObj = { ctr: ctrDiv, type: joArgs.CtrType };
                    var isCancel = false;
                    $.each(ictr._rundata_.igvInitEditCtrl, function () { if (this(joArgs.columnName, $td, ctrObj, $igv) === false) isCancel = true; });
                    if (isCancel) return;
                    ctrObj.ctr.id = ctrDivID;

                    _miss_fun.iGridViewTDEditEvent(ctrObj.ctr, $td, joArgs.columnName, joArgs.ShowField, $igv, $div);
                    $div.attr('_isediting', 'true');
                    if (joArgs.CtrType == "iSelect") {
                        setTimeout(function () { $div.find('>div>input').click(); }, 0);
                    }
                })
                    .off('keydown').on('keydown', function (event) {
                        event = event || window.event;
                        if (event.keyCode === 13 || event.keyCode === 9) //13:回车,9:Tab
                        {
                            $("body").mousedown();
                        }
                    });
            }

            return $html;
        }

        function getItemInfo(columnName) {

            var ret = { col: null, editarg: null };

            var cols = $.JsonObject($igv.attr('columns'))
            for (var i = 0; i < cols.length; i++) {
                var f = cols[i];
                if (f.FieldName.replace('.', '_') == columnName) {
                    ret.col = f;
                    break;
                }
            }
            var ecols = _miss_fun._iGridViewTDEdit_Columns['A' + $igv.attr('id')];
            for (var i = 0; i < ecols.length; i++) {
                var f = ecols[i];
                if (f.columnName.replace('.', '_') == columnName) {
                    ret.editarg = f;
                    break;
                }
            }
            return ret;
        }

        function buildPartnerFields() {
            var fields = $partner.attr('fields');
            if (fields) return;

            var cols = $.JsonObject($igv.attr('columns'))

            fields = [];
            for (var i = 0; i < cols.length; i++) {
                var f = cols[i];
                if (f.FieldName && f.HeadTitle) fields.push(f.FieldName);
            }

            $partner.attr('fields', fields.join(','));
        }
    },

    _iGridViewScrollCtr: null,
    iGridViewScroll: function (obj) {
        var $obj = $(obj);
        var $wrap = $obj.parent();

        var isfdbody = $obj.hasClass('fdbody');

        if (this._iGridViewScrollCtr === 'f' && isfdbody === false || this._iGridViewScrollCtr === 'd' && isfdbody === true) return;

        var scrTop = $obj.scrollTop();

        if (isfdbody) {
            var $dbody = $wrap.find('.dbody');
            if ($dbody.scrollTop() !== scrTop) $dbody.scrollTop(scrTop);
        }
        else {
            var scrLeft = $obj.scrollLeft();
            $wrap.find('.dhead').scrollLeft(scrLeft);
            $wrap.find('.dsum').scrollLeft(scrLeft);
            var $fdbody = $wrap.find('.fdbody');
            if ($fdbody.scrollTop() !== scrTop) {
                $fdbody.scrollTop(scrTop);
            }
        }
    },

    iGridViewExportExcel: function ($wrap) {
        var $loading;
        if (!$wrap || $wrap.css('display') == 'none')
            $loading = $('body').find('.iGridViewLoading');
        else
            $loading = $wrap.find('.iGridViewLoading');
        if ($loading.length == 0) {
            closeLoading();
            openLoading("Generating");
            var $loading = $('.loading-mask>.loading-txt').removeClass('loading-txt').addClass(["iGridViewLoading", "iGridViewExportExcel", "shadow"]);
        }

        if ($wrap) $wrap.find('.Refresh').removeClass('fa-spin');

        var type = $.GetRemoteData("/api/icontrols/iGridViewData/DownloadType");
        var d = new Date();
        var downloadUrl = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();

        var m = svr._currentAssembly;
        if (m && m.length > 5) {
            m = m.substring(0, m.indexOf(',')).substring(m.substring(0, m.indexOf(',')).lastIndexOf('.') + 1);
            if (m.indexOf('Model') == m.length - 5) m = m.substr(0, m.length - 5);
        }
        if (m == 'iGridView') m = document.title.replace(/\s/g, '_')
        m = m || 'A';

        m = m + downloadUrl;

        if (_miss_fun.fnIsExist('GetExportFileName')) {
            m = GetExportFileName() + downloadUrl;
        }

        downloadUrl = "/expfiles/" + m + "." + type;

        var $downlink = $('<a title="' + lang("点击下载\r\n若导出失败，请尝试右击该超链接后选择“目标另存为...”", "DownLoad\r\nIf export fails, please try to right-click the hyperlink and select “save the target as” ...") + '" href="' + downloadUrl + '" _download="true" target="_blank">' + lang('点击下载', 'Download') + '</a>');
        $downlink.click(function () {
            setTimeout(function () {
                $loading.remove();
                closeLoading();
            }, 200);
        });

        $loading.empty().append($downlink).css('left', (parseFloat($loading.css('left')) - 45) + 'px').addClass('iGridViewExportExcel').addClass('shadow');
        return downloadUrl;
    },

    _isPauseAfterChange: false,

    triggerAfterChange: function ($this, isManualChange) {
        if ($this.length == 0) return;
        var win = $this[0].ownerDocument.defaultView
        if (win._miss_fun._isPauseAfterChange) return;
        //触发AfterChange事件
        var val = $this.ival();
        $this.triggerHandler("AfterChange", [val]);
        if (!('vm' in win) || !win.vm.$isPauseWatch) {
            var ctrID = $this.attr('id');
            if (_miss_fun.fnIsExist("AfterChange", win)) AfterChange.apply(win, [$this, ctrID, val, !!isManualChange]);
            $.each(win.ictr._rundata_.afterChange, function () { this.apply(win, [$this, ctrID, val, !!isManualChange]); });
        }
        if (val) $this.iWarning(false);
    },

    iTextValidatePercent: function (txtctr) {
        var PercentMin = $(txtctr).parent().attr('percentmin');
        var val = txtctr.value;
        if (!PercentMin || !val) return;
        val = parseFloat(val);
        var zf = (val > 0 ? 1 : (-1));
        val = Math.abs(val);
        if (val < parseFloat(PercentMin)) {
            val *= 100;
            txtctr.value = $.optimizeNumber(val * zf);
        }
    },

    iListOpenEdit: function (iconBtn) {
        var $wrap = $(iconBtn).parent();
        if ($wrap.attr('isdisabled') == 'true') return;
        var url = "/Common/iControls/iList_Edit?ctrid=" + $wrap.attr('id');
        openDialog(url, function (ret) {
            if (ret === null) return;
            $wrap.ival(ret);
        });
    },

    SetiItemTitleHeight: function ($c) {
        if (!$c) $c = $(document);
        $c.find('div[texttype="textarea"]').each(function () {
            var $this = $(this);
            var ta = $this.find('textarea')[0];
            if (ta && $this.attr('isdisabled') == 'true' && $this.attr('AutoHeight') === 'true' && ta.style.height)  //当前控件不处于隐藏
            {
                ta.style.height = '2px';
                var h = ta.scrollHeight;
                if (h < 21) h = 21;
                ta.style.height = h + 'px';
                $this.css('height', 'auto');
            }
        });
    },

    /**
     * 检测函数是否存在 
     * @param {string} fnName 函数名称（字符串型）
     */
    fnIsExist: function (fnName, win) {
        win = win || window;
        return fnName in window && typeof (eval(fnName)) === "function";
    },

    _i9DialogMoveing: false,
    _i9DialogStartOffsetX: null,
    _i9DialogStartOffsetY: null,

    SetDialogMoveable: function (divDialogID) {
        if ($.browser.isPhone) return;
        window.top._i9DialogStartscrollLeft = $(window.top.document).scrollLeft();
        window.top._i9DialogStartscrollTop = $(window.top.document).scrollTop();

        $(window.top.document.body).find('#' + divDialogID).find('>.dialog_title').off("mousedown").on("mousedown", function (evt) {
            var srcobj = (window.event ? event.srcElement : evt.target).attributes["class"];
            srcobj = srcobj && srcobj.value || '';
            if (srcobj.toString().indexOf('closedialog') >= 0 || srcobj.toString().indexOf('resizeform') >= 0) return;

            var _i9DialogStartOffset = $(this).offset();
            _miss_fun._i9DialogStartOffsetX = evt.clientX - _i9DialogStartOffset.left;
            _miss_fun._i9DialogStartOffsetY = evt.clientY - _i9DialogStartOffset.top;
            var $topDmt = $(window.top.document);
            var $dvDlg = $topDmt.find('#' + divDialogID);
            $(window.top.document.body).off("mousemove").on("mousemove", function (event) {
                if (_miss_fun._i9DialogMoveing == true) {
                    var left = event.clientX - _miss_fun._i9DialogStartOffsetX - $topDmt.scrollLeft();
                    var top = event.clientY - _miss_fun._i9DialogStartOffsetY - $topDmt.scrollTop();
                    if (parseFloat(top.toString()) < 0) top = 0;
                    $dvDlg.css({ "left": left, "top": top });
                    event.returnValue = false;
                    return false;
                }
            }).off("mouseup").on("mouseup", function (event) {
                $(window.top.document.body).unbind("mousemove").unbind("mouseup");
                _miss_fun._i9DialogMoveing = false;
                $topDmt.unbind('selectstart');
            });

            _miss_fun._i9DialogMoveing = true;
            $topDmt.off('selectstart').on("selectstart", function () { return false; });
        });

        // Test via a getter in the options object to see if the passive property is accessed
        var supportsPassive = false;
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function () { supportsPassive = true; }
            });
            window.addEventListener("test", null, opts);
        } catch (e) { }

        window.top.document.addEventListener('scroll', window.top._i9DialogscrollEvent, false);
        window.top.document.addEventListener("mousewheel", window.top._i9DialogmousewheelEvent, supportsPassive ? { passive: false } : false);

        this.SetDialogResizeable(divDialogID);
    },

    SetDialogResizeable: function (divDialogID) {
        var $dlg = $(window.top.document.body).find('#' + divDialogID);
        if ($dlg.attr('canresize') !== 'true') return;

        var dvMark = "<div class='rsMark' style='position:absolute; top:0px; bottom:0px; left:0px; right:0px;'></div>";

        var rs = "<div class='rsLeft w' style='position:absolute; width:3px; top:0px; bottom:5px; left:0px; cursor:e-resize;'></div>" +
            "<div class='rsRight w' style='position:absolute; width:3px; top:0px; bottom:5px; right:0px; cursor:e-resize;'></div>" +
            "<div class='rsTop h' style='position:absolute; height:3px; left:5px; right:5px; top:0px; cursor:s-resize;'></div>" +
            "<div class='rsBottom h' style='position:absolute; height:3px; left:5px; right:5px; bottom:0px; cursor:s-resize;'></div>" +
            "<div class='rsLT w h' style='position:absolute; height:5px; width:5px; left:0px; top:0px; cursor:se-resize;'></div>" +
            "<div class='rsRT w h' style='position:absolute; height:5px; width:5px; right:0px; top:0px; cursor:sw-resize;'></div>" +
            "<div class='rsLB w h' style='position:absolute; height:5px; width:5px; left:0px; bottom:0px; cursor:sw-resize;'></div>" +
            "<div class='rsRB w h' style='position:absolute; height:7px; width:7px; right:0px; bottom:0px; cursor:se-resize;'></div>";

        $dlg.append(rs).off("mousedown", '.w,.h').on("mousedown", '.w,.h', function (event) {
            event = event || window.event;
            var $rs = $(this);
            $(dvMark).insertBefore($dlg.find('.dialog_title'));
            var rawLeft = $dlg.offset().left;
            var rawTop = $dlg.offset().top;
            var rawHeight = $dlg.outerHeight();
            var rawWidth = $dlg.outerWidth();

            $(window.top.document.body).off("mousemove").on("mousemove", function (event) {
                event = event || window.event;
                var cssJo = {};
                if ($rs.hasClass('w')) {
                    var newWidth;
                    if ($rs.hasClass('rsRight') || $rs.hasClass('rsRT') || $rs.hasClass('rsRB')) {
                        newWidth = event.clientX - rawLeft + 2;
                        if (newWidth < 250) newWidth = 250;
                    }
                    else {
                        var newLeft = event.clientX - 2;
                        if (newLeft < 0) newLeft = 0;
                        newWidth = rawLeft - newLeft + rawWidth;
                        if (newWidth < 250) {
                            newWidth = 250;
                            newLeft = rawLeft + rawWidth - newWidth;
                        }
                        cssJo.left = newLeft + 'px';
                    }
                    cssJo.width = newWidth + 'px';
                }

                if ($rs.hasClass('h')) {
                    var newHeight;
                    if ($rs.hasClass('rsBottom') || $rs.hasClass('rsLB') || $rs.hasClass('rsRB')) {
                        newHeight = event.clientY - rawTop + 2;
                        if (newHeight < 170) newHeight = 170;
                    }
                    else {
                        var newTop = event.clientY - 2;
                        if (newTop < 0) newTop = 0;
                        newHeight = rawTop - newTop + rawHeight;
                        if (newHeight < 170) {
                            newHeight = 170;
                            newTop = rawTop + rawHeight - newHeight;
                        }
                        cssJo.top = newTop + 'px';
                    }
                    cssJo.height = newHeight + 'px';
                }
                $dlg.css(cssJo);

            }).off("mouseup").on("mouseup", function () {
                if (window.top && window.top.document) $(window.top.document.body).off("mousemove selectstart");
                $dlg.find('.rsMark').remove();
            }).off("selectstart").on("selectstart", function () { return false; });
        });
    },

    /** 设置或取消（state=true/false）弹窗选值状态（移动端用） */
    setDialogChoose: function (stat) {
        var selfFrame = window.frameElement;
        if (!selfFrame) return;
        var $frm = $(selfFrame);
        if ($frm.attr('ForDialog') !== 'true') return;
        if (stat) {
            $frm.parent().parent().addClass('choose').find('.dialogreturn').text(lang("取消", "CANCEL"));
        }
        else {
            $frm.parent().parent().removeClass('choose').find('.dialogreturn').text(lang("返回", "RETURN"));
        }
    },

    /** 设置弹窗查询按钮（移动端用） */
    setDialogQueryButton: function ($btn, title) {
        if (!$.browser.isPhone) return;
        var selfFrame = window.frameElement;
        if (!selfFrame) return;
        var $frm = $(selfFrame);
        if ($frm.attr('ForDialog') !== 'true' && $frm.hasClass('appportalfrm') == false) return;

        if (!title) title = lang('查询', 'QUERY');

        if ($frm.hasClass('appportalfrm')) {
            $frm.parent().parent().find('>.toptitle>#btnScan').hide();
            $frm.parent().parent().find('>.toptitle>#btnQuery').show();
            $frm.parent().parent().find('>.toptitle>#btnQuery>#btnQuery_text').text(title);
        }
        else {
            $frm.parent().parent().addClass('choose back').find('.dialogok').addClass('query').text(title);
            $frm.parent().parent().find('.titleText').hide();
            $frm.parent().parent().find('.dialogreturn').text(document.title);
        }

        window.oktapped = function () { $btn.click(); };
        if ($btn.attr('ctrtype') == "iButton")
            $btn.parent().hide();
        else
            $btn.hide();
    },

    //重新设定dialog大小
    resizeDialog: function (width, height, callback) {
        width = parseFloat(width || 0);
        height = parseFloat(height || 0);
        var autosize = "";
        if (width !== 0) autosize += "w";
        if (height !== 0) autosize += "h";

        var selfFrame = window.frameElement;
        var selfFrameID = "";
        if (selfFrame) selfFrameID = selfFrame.id;
        if (!selfFrame || !$(selfFrame).attr('ForDialog')) {
            if (window.IsResizing) {
                if (!window._PageSuitedRun) {
                    $(document).triggerHandler("PageSuited");
                    setTimeout(function () { $(window).resize(); }, 100); //触发一下window.resize事件
                    window._PageSuitedRun = true;
                }
                window.IsResizing = null;
            }
            if (callback) callback();
            return;
        }
        var dialogID = selfFrameID.replace('FramDiv_', "DialDiv_");

        var allheight = window.top.innerHeight;
        var allwidth = window.top.innerWidth;

        if (width > allwidth - 10) width = allwidth;
        if (width < 100) width = 100;
        if (height > allheight) height = allheight;
        if (height < 60) height = 60;

        var $dlg = $(window.top.document).find('#' + dialogID);
        $dlg.css("transform", "scale(0.01,0.01)");
        var $dlgContent = $dlg.find('.dialogContent');//.hide();

        if (autosize === "w") {
            $dlg.css({ 'width': width + 'px' });
        }
        else if (autosize === "h") {
            $dlg.css({ 'height': height + 'px' });
        }
        else if (autosize === "wh") {
            $dlg.css({ 'height': height + 'px', 'width': width + 'px' });
        }

        $dlg.zoomOpen({ $parent: 'none' }, function () {
            if ($.browser.ios && $('body').width()) $('body').width($('body').width()); //iPad/iPhone要处理一下body扩大的问题
            $dlg.find('.dialogContent').show();
            //reset igridview-height,重新规划列宽, because container is hide before
            $('div[ctrtype="iGridView"]').each(function () {
                _miss_fun.iGridViewOptimizeWidth($(this).iCtrSetHeight());
            });

            if (window.IsResizing) {
                if (!window._PageSuitedRun) {
                    $(document).triggerHandler("PageSuited");
                    setTimeout(function () {
                        $(window).resize(); //触发一下window.resize事件
                        $('div[ctrtype="iGridView"]').each(function () { _miss_fun.iGridViewOptimizeWidth($(this).iCtrSetHeight()); });
                    }, 0);
                    window._PageSuitedRun = true;
                }
                window.IsResizing = null;
            }
            if (callback) callback();
        });
    },

    _HelpID: '',

    /**openPrint()时，是否是横向打印模式*/
    _IsLandscape: false,

    _LastJsError: '',

    _hasAjaxRequest: false,

    /**是否是顶层窗体*/
    _IsTopMost: function () {

        var r = isTopmost(window);
        if (r != 'unknow') return r;

        var pwin = window.frameElement.ownerDocument.defaultView;
        var r = isTopmost(pwin);
        if (r != 'unknow') return r;

        pwin = pwin.frameElement.ownerDocument.defaultView;
        var r = isTopmost(pwin);
        if (r != 'unknow') return r;

        return true;

        function isTopmost(win) {
            if (!win.frameElement) return true;

            if ($(win.frameElement).hasClass('tabpanelfrm')) {
                if ($(win.top.document).find('#MaskDiv_i9Dialog').length > 0) return false;
                return true;
            }

            if ($(win.frameElement).attr('ForDialog') == 'true') {

                var zidx = $(win.frameElement).parent().parent().css('z-index');
                var zidxmask = win.top.document.getElementById('MaskDiv_i9Dialog').style['z-index'];
                if (zidx - 1 == zidxmask) return true;
                return false;
            }
            return "unknow";
        }
    },

    setHelpFocus: function () {
        setTimeout(function () { if (_topWindow_Help) _topWindow_Help.focus(); }, 100);
    },

    _documentKeyDown: function (e) {
        if (e.keyCode === 118) { //F7
            var helpurl;
            if (e.ctrlKey) //ctrl+F7
                helpurl = document.location.href;
            else {
                var page = svr._currentAssembly;
                if (page && page.indexOf(',') > 0) page = page.substr(0, page.indexOf(','));
                helpurl = '/Common/Help?ID=' + _miss_fun._HelpID + '&Page=' + page;
            }
            var helpWin = window.top._topWindow_Help;
            if (!helpWin || !helpWin.document || !helpWin.document.location) {
                if (e.ctrlKey)
                    helpWin = window.top._topWindow_Help = window.top.open('');
                else {
                    var w = screen.width - 80, h = screen.height - 160;
                    helpWin = window.top._topWindow_Help = window.top.open('', '', 'left=40,top=40,width=' + w + ',height=' + h);
                }
            }
            helpWin.document.location.href = helpurl;
            //获得焦点
            if (window.top._miss_fun) window.top._miss_fun.setHelpFocus.call(window.top);
            return false;
        }
        else if (e.keyCode == 27) //esc
        {
            if (ictr.Intro.isRunning) {
                ictr.Intro.exit();
                return false;
            }
            $('.dvFullForm').each(function () { $(this).iFullform(); });
            return false;
        }
        else if (e.keyCode === 38 || e.keyCode === 37) { //↑←
            if (!ictr.Intro.isRunning) return;
            ictr.Intro.prev();
            return false;
        }
        else if (e.keyCode === 40 || e.keyCode === 39) { //↓→
            if (!ictr.Intro.isRunning) return;
            ictr.Intro.next();
            return false;
        }
    },

    _commitLandrayBpm: function (DocNo, el) {
        var $el = $(el).parent().parent().parent();
        var Note = $el.find('textarea').val();

        if (!Note) {
            $el.find('textarea').iWarning();
            openToast("请输入审批意见", "error");
            return;
        }

        if (!landraySubmitButtonValidate()) return;

        openLoading("正在提交");
        var Options = '0';
        $el.find('input[type="radio"]').each(function (index) {
            if ($(this).prop('checked') === true) {
                Options = index;
                return;
            }
        });

        var args = {
            DocNo: DocNo,
            Options: Options,
            Note: Note
        };
        var url = "/api/common/commitLandrayBpm";
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            timeout: 7200000,
            url: url,
            data: { args: $.toJsonString(args) }
        }).done(function (ret) {
            setTimeout(function () { $el.parentsUntil('[ctrtype="iBpm"]').parent('[ctrtype="iBpm"]').iBpmLoadData(); }, 1000);
            if (ret) {
                openAlert('已成功提交审批内容。');
            }
            else {
                openAlert('提交审批内容失败。');
            }
            closeLoading();
        }).fail(function () {
            openAlert('提交审批内容时发生错误。');
            closeLoading();
        });
    },

    BuildBackground: function (str) {
        var cav = document.createElement("canvas");
        var ctx = cav.getContext('2d');

        cav.width = 200;
        cav.height = 100;

        ctx.translate(0, 0);//设置画布上的(0,0)位置，也就是旋转的中心点
        ctx.rotate(350 * Math.PI / 180);
        ctx.fillStyle = '#eee';
        ctx.font = "14px Arial";

        ctx.fillText(str, 20, 70);

        ndata = cav.toDataURL('image/png', 0.8);
        ctx = null;
        canvas = null;
        return ndata;
    },

    Lunar: {
        /**用法
        * Lunar.toSolar(2016, 6, 3); 农历转化公历
        * Lunar.toLunar(2016, 7, 6); 公历转化农历
        */
        MIN_YEAR: 1891,
        MAX_YEAR: 2100,
        lunarInfo: [
            [0, 2, 9, 21936], [6, 1, 30, 9656], [0, 2, 17, 9584], [0, 2, 6, 21168], [5, 1, 26, 43344], [0, 2, 13, 59728],
            [0, 2, 2, 27296], [3, 1, 22, 44368], [0, 2, 10, 43856], [8, 1, 30, 19304], [0, 2, 19, 19168], [0, 2, 8, 42352],
            [5, 1, 29, 21096], [0, 2, 16, 53856], [0, 2, 4, 55632], [4, 1, 25, 27304], [0, 2, 13, 22176], [0, 2, 2, 39632],
            [2, 1, 22, 19176], [0, 2, 10, 19168], [6, 1, 30, 42200], [0, 2, 18, 42192], [0, 2, 6, 53840], [5, 1, 26, 54568],
            [0, 2, 14, 46400], [0, 2, 3, 54944], [2, 1, 23, 38608], [0, 2, 11, 38320], [7, 2, 1, 18872], [0, 2, 20, 18800],
            [0, 2, 8, 42160], [5, 1, 28, 45656], [0, 2, 16, 27216], [0, 2, 5, 27968], [4, 1, 24, 44456], [0, 2, 13, 11104],
            [0, 2, 2, 38256], [2, 1, 23, 18808], [0, 2, 10, 18800], [6, 1, 30, 25776], [0, 2, 17, 54432], [0, 2, 6, 59984],
            [5, 1, 26, 27976], [0, 2, 14, 23248], [0, 2, 4, 11104], [3, 1, 24, 37744], [0, 2, 11, 37600], [7, 1, 31, 51560],
            [0, 2, 19, 51536], [0, 2, 8, 54432], [6, 1, 27, 55888], [0, 2, 15, 46416], [0, 2, 5, 22176], [4, 1, 25, 43736],
            [0, 2, 13, 9680], [0, 2, 2, 37584], [2, 1, 22, 51544], [0, 2, 10, 43344], [7, 1, 29, 46248], [0, 2, 17, 27808],
            [0, 2, 6, 46416], [5, 1, 27, 21928], [0, 2, 14, 19872], [0, 2, 3, 42416], [3, 1, 24, 21176], [0, 2, 12, 21168],
            [8, 1, 31, 43344], [0, 2, 18, 59728], [0, 2, 8, 27296], [6, 1, 28, 44368], [0, 2, 15, 43856], [0, 2, 5, 19296],
            [4, 1, 25, 42352], [0, 2, 13, 42352], [0, 2, 2, 21088], [3, 1, 21, 59696], [0, 2, 9, 55632], [7, 1, 30, 23208],
            [0, 2, 17, 22176], [0, 2, 6, 38608], [5, 1, 27, 19176], [0, 2, 15, 19152], [0, 2, 3, 42192], [4, 1, 23, 53864],
            [0, 2, 11, 53840], [8, 1, 31, 54568], [0, 2, 18, 46400], [0, 2, 7, 46752], [6, 1, 28, 38608], [0, 2, 16, 38320],
            [0, 2, 5, 18864], [4, 1, 25, 42168], [0, 2, 13, 42160], [10, 2, 2, 45656], [0, 2, 20, 27216], [0, 2, 9, 27968],
            [6, 1, 29, 44448], [0, 2, 17, 43872], [0, 2, 6, 38256], [5, 1, 27, 18808], [0, 2, 15, 18800], [0, 2, 4, 25776],
            [3, 1, 23, 27216], [0, 2, 10, 59984], [8, 1, 31, 27432], [0, 2, 19, 23232], [0, 2, 7, 43872], [5, 1, 28, 37736],
            [0, 2, 16, 37600], [0, 2, 5, 51552], [4, 1, 24, 54440], [0, 2, 12, 54432], [0, 2, 1, 55888], [2, 1, 22, 23208],
            [0, 2, 9, 22176], [7, 1, 29, 43736], [0, 2, 18, 9680], [0, 2, 7, 37584], [5, 1, 26, 51544], [0, 2, 14, 43344],
            [0, 2, 3, 46240], [4, 1, 23, 46416], [0, 2, 10, 44368], [9, 1, 31, 21928], [0, 2, 19, 19360], [0, 2, 8, 42416],
            [6, 1, 28, 21176], [0, 2, 16, 21168], [0, 2, 5, 43312], [4, 1, 25, 29864], [0, 2, 12, 27296], [0, 2, 1, 44368],
            [2, 1, 22, 19880], [0, 2, 10, 19296], [6, 1, 29, 42352], [0, 2, 17, 42208], [0, 2, 6, 53856], [5, 1, 26, 59696],
            [0, 2, 13, 54576], [0, 2, 3, 23200], [3, 1, 23, 27472], [0, 2, 11, 38608], [11, 1, 31, 19176], [0, 2, 19, 19152],
            [0, 2, 8, 42192], [6, 1, 28, 53848], [0, 2, 15, 53840], [0, 2, 4, 54560], [5, 1, 24, 55968], [0, 2, 12, 46496],
            [0, 2, 1, 22224], [2, 1, 22, 19160], [0, 2, 10, 18864], [7, 1, 30, 42168], [0, 2, 17, 42160], [0, 2, 6, 43600],
            [5, 1, 26, 46376], [0, 2, 14, 27936], [0, 2, 2, 44448], [3, 1, 23, 21936], [0, 2, 11, 37744], [8, 2, 1, 18808],
            [0, 2, 19, 18800], [0, 2, 8, 25776], [6, 1, 28, 27216], [0, 2, 15, 59984], [0, 2, 4, 27424], [4, 1, 24, 43872],
            [0, 2, 12, 43744], [0, 2, 2, 37600], [3, 1, 21, 51568], [0, 2, 9, 51552], [7, 1, 29, 54440], [0, 2, 17, 54432],
            [0, 2, 5, 55888], [5, 1, 26, 23208], [0, 2, 14, 22176], [0, 2, 3, 42704], [4, 1, 23, 21224], [0, 2, 11, 21200],
            [8, 1, 31, 43352], [0, 2, 19, 43344], [0, 2, 7, 46240], [6, 1, 27, 46416], [0, 2, 15, 44368], [0, 2, 5, 21920],
            [4, 1, 24, 42448], [0, 2, 12, 42416], [0, 2, 2, 21168], [3, 1, 22, 43320], [0, 2, 9, 26928], [7, 1, 29, 29336],
            [0, 2, 17, 27296], [0, 2, 6, 44368], [5, 1, 26, 19880], [0, 2, 14, 19296], [0, 2, 3, 42352], [4, 1, 24, 21104],
            [0, 2, 10, 53856], [8, 1, 30, 59696], [0, 2, 18, 54560], [0, 2, 7, 55968], [6, 1, 27, 27472], [0, 2, 15, 22224],
            [0, 2, 5, 19168], [4, 1, 25, 42216], [0, 2, 12, 42192], [0, 2, 1, 53584], [2, 1, 21, 55592], [0, 2, 9, 54560]
        ],
        //是否闰年
        isLeapYear: function (year) {
            return ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0));
        },
        //天干地支年
        lunarYear: function (year) {
            var gan = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
                zhi = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'],
                str = year.toString().split("");
            return gan[str[3]] + zhi[year % 12];
        },
        //生肖年
        zodiacYear: function (year) {
            var zodiac = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
            return zodiac[year % 12];
        },
        solarFestivals: ["0101 元旦", "0214 情人节", "0308 妇女节", "0312 植树节", "0401 愚人节", "0501 劳动节", "0504 青年节", "0512 护士节", "0601 儿童节", "0701 建党节", "0801 建军节", "0910 教师节", "1001 国庆节", "1031 万圣节", "1225 圣诞节"],
        lunarFestivals: ["0101 春节", "0115 元宵节", "0505 端午节", "0707 七夕", "0715 中元节", "0815 中秋节", "0909 重阳节", "1208 腊八节", "1224 小年", "1230 除夕"],

        //公历月份天数
        // year 阳历-年
        // month 阳历-月
        solarMonthDays: function (year, month) {
            var FebDays = this.isLeapYear(year) ? 29 : 28;
            var monthHash = ['', 31, FebDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return monthHash[month];
        },
        //农历月份天数
        lunarMonthDays: function (year, month) {
            var monthData = this.lunarMonths(year);
            return monthData[month - 1];
        },
        //农历月份天数数组
        lunarMonths: function (year) {
            var yearData = this.lunarInfo[year - this.MIN_YEAR];
            var leapMonth = yearData[0];
            var bit = (+yearData[3]).toString(2);
            var months = [];
            for (var i = 0; i < bit.length; i++) {
                months[i] = bit.substr(i, 1);
            }

            for (var k = 0, len = 16 - months.length; k < len; k++) {
                months.unshift('0');
            }

            months = months.slice(0, (leapMonth == 0 ? 12 : 13));
            for (var i = 0; i < months.length; i++) {
                months[i] = +months[i] + 29;
            }
            return months;
        },
        //农历每年的天数
        // year 农历年份
        lunarYearDays: function (year) {
            var monthArray = this.lunarYearMonths(year);
            var len = monthArray.length;
            return (monthArray[len - 1] == 0 ? monthArray[len - 2] : monthArray[len - 1]);
        },
        //
        lunarYearMonths: function (year) {
            var monthData = this.lunarMonths(year);
            var res = [];
            var temp = 0;
            var yearData = this.lunarInfo[year - this.MIN_YEAR];
            var len = (yearData[0] == 0 ? 12 : 13);
            for (var i = 0; i < len; i++) {
                temp = 0;
                for (j = 0; j <= i; j++) {
                    temp += monthData[j];
                }
                res.push(temp);
            }
            return res;
        },
        //获取闰月
        // year 农历年份
        leapMonth: function (year) {
            var yearData = this.lunarInfo[year - this.MIN_YEAR];
            return yearData[0];
        },
        //计算农历日期与正月初一相隔的天数
        betweenLunarDays: function (year, month, day) {
            var yearMonth = this.lunarMonths(year);
            var res = 0;
            for (var i = 1; i < month; i++) {
                res += yearMonth[i - 1];
            }
            res += day - 1;
            return res;
        },
        //计算2个阳历日期之间的天数
        // year 阳历年
        // month
        // day
        // l_month 阴历正月对应的阳历月份
        // l_day  阴历初一对应的阳历天
        betweenSolarDays: function (year, month, day, l_month, l_day) {
            var time1 = new Date(year, month - 1, day).getTime(),
                time2 = new Date(year, l_month - 1, l_day).getTime();
            return Math.ceil((time1 - time2) / 24 / 3600 / 1000);
        },
        //根据距离正月初一的天数计算阴历日期
        // year 阳历年
        // between 天数
        lunarByBetween: function (year, between) {
            var lunarArray = [], yearMonth = [], t = 0, e = 0, leapMonth = 0, m = '';
            if (between == 0) {
                t = 1;
                e = 1;
                m = '正月';
            } else {
                year = between > 0 ? year : (year - 1);
                yearMonth = this.lunarYearMonths(year);
                leapMonth = this.leapMonth(year);
                between = between > 0 ? between : (this.lunarYearDays(year) + between);
                for (var i = 0; i < 13; i++) {
                    if (between == yearMonth[i]) {
                        t = i + 2;
                        e = 1;
                        break;
                    } else if (between < yearMonth[i]) {
                        t = i + 1;
                        e = between - ((yearMonth[i - 1]) ? yearMonth[i - 1] : 0) + 1;
                        break;
                    }
                }

                m = (leapMonth != 0 && t == leapMonth + 1)
                    ? ('闰' + this.chineseMonth(t - 1))
                    : this.chineseMonth(((leapMonth != 0 && leapMonth + 1 < t) ? (t - 1) : t));
            }
            lunarArray.push(year, t, e); //年 月 日
            lunarArray.push(this.lunarYear(year),
                this.zodiacYear(year),
                m,
                this.chineseNumber(e)); //天干地支年 生肖 月份 日
            lunarArray.push(leapMonth); //闰几月
            return lunarArray;
        },
        //中文月份
        chineseMonth: function (month) {
            var monthHash = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
            return monthHash[month];
        },
        //中文日期
        chineseNumber: function (num) {
            var dateHash = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
            if (num <= 10) {
                res = '初' + dateHash[num];
            } else if (num > 10 && num < 20) {
                res = '十' + dateHash[num - 10];
            } else if (num == 20) {
                res = "二十";
            } else if (num > 20 && num < 30) {
                res = "廿" + dateHash[num - 20];
            } else if (num == 30) {
                res = "三十";
            }
            return res;
        },

        /**转换农历, 输出数组：[1891, 1, 1, '辛卯', '兔', '正月', '初一', 0, '春节']*/
        toLunar: function (year, month, day) {
            var yearData = this.lunarInfo[year - this.MIN_YEAR];
            if (year == this.MIN_YEAR && month <= 2 && day <= 9) {
                return [1891, 1, 1, '辛卯', '兔', '正月', '初一', '春节'];
            }

            var arrRet = this.lunarByBetween(year, this.betweenSolarDays(year, month, day, yearData[1], yearData[2]));

            var festival = '';
            var mmdd = (('0' + month).substr(('0' + month).length - 2)) + (('0' + day).substr(('0' + day).length - 2));
            for (i in this.solarFestivals) {
                if (this.solarFestivals[i].substr(0, 4) == mmdd) {
                    festival = this.solarFestivals[i].substr(5);
                    break;
                }
            }
            var mmdd = (('0' + arrRet[1]).substr(('0' + arrRet[1]).length - 2)) + (('0' + arrRet[2]).substr(('0' + arrRet[2]).length - 2));
            for (i in this.lunarFestivals) {
                if (this.lunarFestivals[i].substr(0, 4) == mmdd) {
                    festival = this.lunarFestivals[i].substr(5);
                    break;
                }
            }
            arrRet.push(festival);
            return arrRet;
        },
        /**
         * 转换公历，输出数组：[year, month, day]
         * @param {number} year 阴历-年
         * @param {number} month 阴历-月，闰月处理：例如如果当年闰五月，那么第二个五月就传六月，相当于阴历有13个月
         * @param {number} day 阴历-日
         */
        toSolar: function (year, month, day) {
            var yearData = this.lunarInfo[year - this.MIN_YEAR];
            var between = this.betweenLunarDays(year, month, day);
            var ms = new Date(year, yearData[1] - 1, yearData[2]).getTime();
            var s = ms + between * 24 * 60 * 60 * 1000;
            var d = new Date();
            d.setTime(s);
            year = d.getFullYear();
            month = d.getMonth() + 1;
            day = d.getDate();
            return [year, month, day];
        },
        /**
         * 根据日期输出农历日名称：三月 / 初二 / 春节
         * @param {Date} d 日期
         */
        getLunarDay: function (d) {
            d = new Date(d);
            var l = this.toLunar(d.getFullYear(), d.getMonth() + 1, d.getDate());
            if (l[8]) return l[8]
            return l[6] == "初一" ? l[5] : l[6];
        }
    },

    iTextDatePicker: function ($ctr) {
        if ($ctr.attr('ctrtype') === 'iText') $ctr = $ctr.find('input');
        if ($ctr.length === 0) return;
        var $wrap = $ctr.attr('ctrtype') ? $ctr : $ctr.parent();
        var isCalendar = $wrap.attr('ctrtype') === 'iCalendar';

        var pickertype = $wrap.attr('texttype') || ($wrap.attr('CalendarType') || "date");

        var chosenValue;
        var childpickerID = 'iCtrlChildPicker' + Math.random().toString().replace('.', '').replace('-', '');
        var childpicker = null;

        var ctrID = $wrap.attr('id');
        var showLunar = false;
        var isDetail = false;
        //iCalendar
        if (isCalendar) {
            showLunar = $wrap.attr('showLuner') === 'true';
            isDetail = $wrap.attr('isDetail') === 'true';
            setInitValue($wrap.attr('value'));
            newchildpickerHTML();

            $wrap.empty().append(childpicker);
            return;
        }

        $ctr.attr('childpickerID', childpickerID);
        setInitValue($.trim($ctr.val()));
        return newchildpickerHTML().css({ 'position': 'absolute', 'visibility': 'hidden' }).on('blur', function () { $ctr.blur(); });

        function setInitValue(initialDate) {
            initialDate = initialDate || '';
            if (initialDate.length <= 2) initialDate = '';
            if (pickertype === 'period' || pickertype === 'periodm')
                chosenValue = $.formatDate(new Date(), "yyyy-MM");
            else if (pickertype === "periodq" || pickertype === "periodh")
                chosenValue = "";
            else
                chosenValue = new Date();
            if (initialDate) {
                if (pickertype.substr(0, 3) === "per")
                    chosenValue = initialDate;
                else {
                    if (pickertype === "time") {
                        initialDate = "2016-01-01 " + initialDate;
                    }
                    var ss1 = initialDate.split('-');
                    if (ss1.length <= 1) ss1 = initialDate.split('/');
                    if (ss1.length > 1) {
                        var iyear = ss1[0];
                        if (iyear.length === 2) iyear = '20' + iyear;
                        var imonth = ss1[1];
                        if (ss1.length > 2) {
                            var iday = ss1[2];
                        } else {
                            iday = '1';
                        }

                        var ihour = 0;
                        var iminute = 0;

                        if ((pickertype === "datetime" || pickertype === "time") && iday.indexOf(' ') > 0) {
                            var st = iday.split(' ')[1];
                            iday = iday.substr(0, iday.indexOf(' '));

                            if (st.indexOf(':') > 0) {
                                ihour = st.split(':')[0];
                                iminute = st.split(':')[1];
                            }
                        }
                        chosenValue = new Date(iyear, imonth - 1, iday, ihour, iminute);
                    }
                }
            }

        }

        function setValue_time() {
            if (!chosenValue) {
                $ctr.val('');
            }
            else {
                $ctr.val(getFormattedTime());
            }
            $wrap.attr('_rawValue', $ctr.val());
            _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件
        }

        function getFormattedTime() {
            var h = chosenValue.getHours().toString();
            var m = chosenValue.getMinutes().toString();
            if (h.length === 1) h = "0" + h;
            if (m.length === 1) m = "0" + m;
            return h + ":" + m;
        }

        function newchildpickerHTML() {

            var plang = {
                annual: ['全年', 'Annual'],
                h1: ['上半年', '1st half year'],
                h2: ['下半年', '2nd half year'],

                q1: ['1季度', 'Q1'],
                q2: ['2季度', 'Q2'],
                q3: ['3季度', 'Q3'],
                q4: ['4季度', 'Q4'],

                sun: ['日', 'Su'],
                mon: ['一', 'Mo'],
                tue: ['二', 'Tu'],
                wed: ['三', 'We'],
                thu: ['四', 'Th'],
                fri: ['五', 'Fr'],
                sat: ['六', 'Sa'],
                hour: ['时', 'h'],
                minute: ['分', 'm'],
            }

            var langIdx = lang.isEn() ? 1 : 0;

            if (pickertype === "time") {
                var MinuteStep = parseInt($wrap.attr('MinuteStep')) || 1;

                var ulHour = "<ul tabindex=\"9999\" ultype=\"hour\">";
                for (var i = 0; i <= 23; i++) {
                    var hour = i.toString();
                    if (hour.length === 1) hour = "0" + hour;
                    ulHour += '<li>' + hour + '</li>';
                }
                ulHour += '</ul>';

                var ulMinute = "<ul tabindex=\"9999\" ultype=\"minute\">";
                for (i = 0; i <= 59; i += MinuteStep) {
                    var minute = i.toString();
                    if (minute.length === 1) minute = "0" + minute;
                    ulMinute += '<li>' + minute + '</li>';
                }
                ulMinute += '</ul>';
                table = '<div style="float:left;">' + ulHour + '</div>';
                table += '<span class="colon">:</span><div style="float:right; border-left:1px solid #eee;">' + ulMinute + '</div>';
                if (!isCalendar) table += '<div class="footer"><span style="float:left;" clear="1">' + lang(24) + '</span><span style="float:left; padding-left:20px;" now="1">' + lang(140) + '</span><span style="float:right;color:#400080;" ok="1">' + lang(11) + '</span></div>';

                table = $(table);

                $('ul', table).blur(function () { $ctr.blur(); });

                childpicker = $('<div class="childpicker-wrap-time shadow" id="' + childpickerID + '" pickertype="' + pickertype + '" tabindex="99999")></div>').append(table);
                loadMonth_time();
                return childpicker;
            }

            var table = $('<table cellpadding="0" cellspacing="0" style="min-width:180px; min-height:200px;"></table>');
            table.append('<thead></thead>');
            table.append('<tfoot></tfoot>');
            table.append('<tbody class="days"></tbody>');

            if (pickertype.substr(0, 3) === "per") {
                $("thead", table).append('<tr class="controls" style="height:28px;"><th colspan="4">'
                    + '<span class="prevYear xiconfont xicon-doubleleft" style="margin-right:15px;color:#777;width:45px;display:inline-block;" title="' + lang(145) + '"></span>'
                    + '<span name="year" style="font-size:16px;"></span>'
                    + '<span class="nextYear xiconfont xicon-doubleright" style="margin-left:15px;color:#777;width:45px;display:inline-block;" title="' + lang(146) + '"></span>'
                    + '</th></tr>');
            }
            //period
            if (pickertype === "period") {
                if (!isCalendar) $("tfoot", table).append('<tr><td><span class="clean">' + lang(24) + '</span></td><td colspan=2><span class="today">' + lang(142) + '</span></td><td><span class="close">' + lang(15) + '</span></td></tr>');
                $("tbody", table).append('<tr><td month="01">' + lang(101) + '</td><td month="02">' + lang(102) + '</td><td month="03">' + lang(103) + '</td><td month="04">' + lang(104) + '</td></tr><tr><td month="05">' + lang(105) + '</td><td month="06">' + lang(106) + '</td><td month="07">' + lang(107) + '</td><td month="08">' + lang(108) + '</td></tr><tr><td month="09">' + lang(109) + '</td><td month="10">' + lang(110) + '</td><td month="11">' + lang(111) + '</td><td month="12">' + lang(112) + '</td></tr>');
            }
            else if (pickertype === "periodq") {
                if (!isCalendar) $("tfoot", table).append('<tr><td colspan="2"><span class="clean">' + lang(24) + '</span></td><td colspan="2"><span class="close">' + lang(15) + '</span></td></tr>');
                $("tbody", table).append('<tr><td colspan="2" month="Q1">' + plang.q1[langIdx] + '</td><td colspan="2" month="Q2">' + plang.q2[langIdx] + '</td></tr><tr><td colspan="2" month="Q3">' + plang.q3[langIdx] + '</td><td colspan="2" month="Q4">' + plang.q4[langIdx] + '</td></tr>');
            } else if (pickertype === "periodh") {
                if (!isCalendar) $("tfoot", table).append('<tr><td colspan="2"><span class="clean">' + lang(24) + '</span></td><td colspan="2"><span class="close">' + lang(15) + '</span></td></tr>');
                $("tbody", table).append('<tr><td colspan="4" month="H1">' + lang(136) + '</td></tr><tr><td colspan="4" month="H2">' + lang(137) + '</td></tr>');
            } else if (pickertype === "periodm") {
                if (!isCalendar) $("tfoot", table).append('<tr><td><span class="clean">' + lang(24) + '</span></td><td colspan=2><span class="today">' + lang(142) + '</span></td><td><span class="close">' + lang(15) + '</span></td></tr>');
                $("tbody", table).append('<tr><td month="01">' + lang(101) + '</td><td month="02">' + lang(102) + '</td><td month="03">' + lang(103) + '</td><td month="04">' + lang(104) + '</td></tr><tr><td month="05">' + lang(105) + '</td><td month="06">' + lang(106) + '</td><td month="07">' + lang(107) + '</td><td month="08">' + lang(108) + '</td></tr><tr><td month="09">' + lang(109) + '</td><td month="10">' + lang(110) + '</td><td month="11">' + lang(111) + '</td><td month="12">' + lang(112) + '</td></tr>');
                $("tbody", table).append('<tr><td month="Q1">' + plang.q1[langIdx] + '</td><td month="Q2">' + plang.q2[langIdx] + '</td><td month="Q3">' + plang.q3[langIdx] + '</td><td month="Q4">' + plang.q4[langIdx] + '</td></tr>');
                $("tbody", table).append('<tr><td month="H1">' + lang(136) + '</td><td colspan="2" month="FY">' + lang(135) + '</td><td month="H2">' + lang(137) + '</td></tr>');
            } else {
                $("thead", table).append('<tr class="controls" style="height:28px;"><td colspan="7" style="padding:0px;line-height:23px;">'
                    + '<span class="prevYear xiconfont xicon-doubleleft" style="color:#555;width:15%;float:left;font-size:16px;" title="' + lang(145) + '"></span>'
                    + '<span class="prevMonth xiconfont xicon-return1" style="color:#555;width:15%;float:left;" title="' + lang(147) + '"></span>'
                    + '<span class="currentPeriod" style="width:40%;float:left;"><span name="year"></span><span style="margin:0px 4px;">-</span><span name="month"></span></span>'
                    + '<span class="nextMonth xiconfont xicon-right1" style="color:#555;width:15%;float:left;" title="' + lang(148) + '"></span>'
                    + '<span class="nextYear xiconfont xicon-doubleright" style="color:#555;width:15%;float:left;font-size:16px;" title="' + lang(146) + '"></span>'
                    + '</td></tr>');
                $("thead", table).append('<tr class="days"><td>' + plang.sun[langIdx] + '</td><td>' + plang.mon[langIdx] + '</td><td>' + plang.tue[langIdx] + '</td><td>' + plang.wed[langIdx] + '</td><td>' + plang.thu[langIdx] + '</td><td>' + plang.fri[langIdx] + '</td><td>' + plang.sat[langIdx] + '</td></tr>');
                if (pickertype === "datetime") {
                    var MinuteStep = parseInt($wrap.attr('MinuteStep')) || 1;
                    if (MinuteStep <= 0) MinuteStep = 1;

                    var dsHour = new ictr.iSelectOptions();
                    for (var i = 0; i <= 23; i++) {
                        dsHour.add(i.toString());
                    }

                    var hourselect = "<div ctrtype='iSelect' id='_iTextDatetimePicker_Hour' class='ictr-wrap rounded' style='max-height:9999px;width:65px;padding-right:21px;margin-right:8px;float:left;' ds='" + dsHour.toDS() + "'><input type='text' class='ictr-input' readonly='readonly' style='text-align:center;'><span class='xiconfont righticon fa-rotate-trans xicon-down' tabindex='99999'></span></div>";

                    var dsMinute = new ictr.iSelectOptions();
                    for (var i = 0; i <= 59; i += MinuteStep) {
                        dsMinute.add(i.toString());
                    }

                    var minuteselect = "<div ctrtype='iSelect' id='_iTextDatetimePicker_Minute' class='ictr-wrap rounded' style='max-height:9999px;width:65px;padding-right:21px;margin-right:8px;float:left' ds='" + dsMinute.toDS() + "'><input type='text' class='ictr-input' readonly='readonly' style='text-align:center;'><span class='xiconfont righticon fa-rotate-trans xicon-down' tabindex='99999'></span></div>";

                    $("tfoot", table).append('<tr><td colspan="3" style="text-align:right">' + hourselect + '<span style="line-height:23px;">' + plang.hour[langIdx] + '</span></td><td>:</td><td colspan="3"  style="text-align:left">' + minuteselect + '<span style="line-height:23px;">' + plang.minute[langIdx] + '</span></td></tr>');
                    $("tfoot", table).iControls();

                    if (!isCalendar) $("tfoot", table).append('<tr><td colspan="7" style="font-size:8pt; height:21px"><span class="clean" style="width:25%;display:inline-block;">' + lang(24) + '</span><span class="today" style="width:25%;display:inline-block;">' + lang(141) + '</span><span class="okclose" style="color:#400080;width:25%;display:inline-block;">' + lang(11) + '</span><span class="close" style="width:25%;display:inline-block;">' + lang(15) + '</span></td></tr>');
                }
                else if (!isCalendar) {
                    $("tfoot", table).append('<tr><td colspan="2"><span class="clean">' + lang(24) + '</span></td><td colspan="3"><span class="today">' + lang(141) + '</span></td><td colspan="2"><span class="close">' + lang(15) + '</span></td></tr>');
                }
                for (var i = 0; i < 6; i++) $("tbody", table).append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
            }
            if (!isCalendar) $('td', table).blur(function () { $ctr.blur(); });
            $('tbody td', table).hover(function () { $(this).addClass('hover'); }, function () { $(this).removeClass('hover'); });
            childpicker = $('<div class="childpicker-wrap shadow' + (pickertype == 'time' ? '-time' : '') + '" id="' + childpickerID + '" pickertype="' + pickertype + '" tabindex="99999")></div>').append(table);

            $("span.prevYear,span.nextYear,span.prevMonth,span.nextMonth", childpicker).off('click').click(function (e) { loadMonth(e); });
            $("span.today", childpicker).off('click').click(function () { closeIt(1); });
            $("span.clean", childpicker).off('click').click(function () { closeIt(''); });
            $("span.okclose", childpicker).off('click').click(function () { closeIt(); });
            $("span.close", childpicker).off('click').click(function () { closeIt('0'); });

            var $month = $("span[name=month]", childpicker).click(function () {
                if (childpicker.find('.selectmonth').length === 0) {
                    childpicker.find('.selectyear').remove();
                    buildselect('month');
                }
                else {
                    childpicker.find('.selectmonth').remove();
                }
            });
            var $year = $("span[name=year]", childpicker).click(function () {
                if (childpicker.find('.selectyear').length === 0) {
                    childpicker.find('.selectmonth').remove();
                    buildselect('year');
                }
                else {
                    childpicker.find('.selectyear').remove();
                }
            });
            if ($year.length === 1) $year.text(chosenValue.getFullYear ? chosenValue.getFullYear() : (chosenValue.substr(0, 4) || new Date().getFullYear()));
            if ($month.length === 1) $month.text(chosenValue.getMonth ? chosenValue.getMonth() + 1 : chosenValue.substr(5));

            if ($("#_iTextDatetimePicker_Hour", childpicker).length > 0) {
                $("#_iTextDatetimePicker_Hour", childpicker).ival(chosenValue.getHours()).on('blur', function () {
                    console.log($(this).attr('id') + ':blur');
                    $ctr.blur();
                });
                $("#_iTextDatetimePicker_Minute", childpicker).ival(chosenValue.getMinutes()).on('blur', function () {
                    $ctr.blur();
                });
            }
            loadMonth(null);
            return childpicker;
        }

        function loadMonth(e) {
            if (pickertype.substr(0, 3) === "per") return loadMonth_Period(e, pickertype);
            if (pickertype === "time") return loadMonth_time();

            if (e && $(e.target).hasClass("timeselect")) return;

            var monthlengths = '31,28,31,30,31,30,31,31,30,31,30,31'.split(',');

            var $month = $("span[name=month]", childpicker);
            var $year = $("span[name=year]", childpicker);

            var mo = $month.text() * 1 || (new Date().getMonth() + 1);
            var yr = $year.text() * 1 || (new Date().getFullYear());

            if (e && $(e.target).hasClass('prevYear')) {
                if (yr > 0) yr--;
            }
            else if (e && $(e.target).hasClass('nextYear')) {
                yr++;
            }
            else if (e && $(e.target).hasClass('prevMonth')) {
                if (mo === 1) {
                    if (yr > 1) {
                        yr--;
                        mo = 12;
                    }
                } else {
                    mo--;
                }
            }
            else if (e && $(e.target).hasClass('nextMonth')) {
                if (mo === 12) {
                    yr++;
                    mo = 1;
                } else {
                    mo++;
                }
            }

            $month.text($.PadLeft(mo));
            $year.text(yr);

            ictr.BeforeBuildCalendar(yr, mo, ctrID);

            var cells = $("tbody.days td", childpicker).off('click').empty().removeClass('date');

            var d = new Date(yr, mo - 1, 1);
            var startindex = d.getDay();
            var numdays = monthlengths[mo - 1];
            if (mo === 2 && ((yr % 4 == 0 && yr % 100 != 0) || yr % 400 == 0)) numdays = 29;

            //填充上个月
            var lastmonth = (mo == 1 ? 12 : mo - 1);
            var lastyear = (lastmonth == 12 ? yr - 1 : yr);
            var lastnumdays = monthlengths[lastmonth - 1];
            if (1 == lastmonth && ((lastyear % 4 == 0 && lastyear % 100 != 0) || lastyear % 400 == 0)) lastnumdays = 29;

            for (var i = 0; i < startindex; i++) {
                var cell = $(cells.get(i)).removeClass('chosen');
                var nowDay = lastnumdays - startindex + i + 1;
                var nowVal = lastyear + '-' + $.PadLeft(lastmonth) + '-' + $.PadLeft(nowDay);

                var cellval = ictr.BuildCalendar(nowDay, nowVal, 'prev', cell, ctrID) || '';

                var cellhtml = nowDay;
                if (isDetail) {
                    cellhtml = '<div class="dayinfo"><div class="day1">' + nowDay + '</div><div class="day2">' + _miss_fun.Lunar.getLunarDay(nowVal) + '</div></div><div class="detail">' + cellval + '</div>';
                }
                else if (showLunar) {
                    cellhtml = '<span style="font-weight:bold;">' + nowDay + '</span><br><span style="color:#aaa;">' + _miss_fun.Lunar.getLunarDay(nowVal) + '</span>';
                }
                else if (cellval) {
                    cellhtml = cellval;
                }

                cell.attr('v', nowVal)
                    .attr('d', nowDay)
                    .html(cellhtml)
                    .addClass('disabledate').off('click')
                    .click(function () {
                        var currentyear = $("span[name=year]", childpicker).text();
                        var currentmonth = $("span[name=month]", childpicker).text();
                        if (currentmonth > 1) {
                            currentmonth--;
                        } else {
                            currentmonth = 12;
                            currentyear--;
                        }

                        chosenValue = new Date(currentyear, currentmonth - 1, $(this).attr('d'));
                        if (pickertype === "datetime") {
                            cells.removeClass('chosen');
                            $(this).addClass('chosen');
                        } else {
                            closeIt();
                        }
                    });
            }

            //填充当月
            for (var i = 0; i < numdays; i++) {
                var cell = $(cells.get(i + startindex)).removeClass('chosen');
                var nowDay = i + 1;
                var nowVal = yr + '-' + $.PadLeft(mo) + '-' + $.PadLeft(nowDay);

                var cellval = ictr.BuildCalendar(nowDay, nowVal, 'prev', cell, ctrID) || '';

                var cellhtml = nowDay;
                if (isDetail) {
                    cellhtml = '<div class="dayinfo"><div class="day1">' + nowDay + '</div><div class="day2">' + _miss_fun.Lunar.getLunarDay(nowVal) + '</div></div><div class="detail">' + cellval + '</div>';
                }
                else if (showLunar) {
                    cellhtml = '<span style="font-weight:bold;">' + nowDay + '</span><br><span style="color:#aaa;">' + _miss_fun.Lunar.getLunarDay(nowVal) + '</span>';
                }
                else if (cellval) {
                    cellhtml = cellval;
                }
                cell.attr('v', nowVal)
                    .attr('d', nowDay)
                    .html(cellhtml)
                    .removeClass('disabledate')
                    .on({
                        click: function () {
                            chosenValue = new Date($("span[name=year]", childpicker).text(), $("span[name=month]", childpicker).text() - 1, $(this).attr('d'));
                            cells.removeClass('chosen');
                            $(this).addClass('chosen');
                            if (pickertype !== "datetime") closeIt();
                        }
                    });
                if (i + 1 == chosenValue.getDate() && mo == chosenValue.getMonth() + 1 && yr == chosenValue.getFullYear()) {
                    cell.addClass('chosen');
                }
            }

            //填充后一个月
            var nextmonth = (mo == 12 ? 1 : mo + 1);
            var nextyear = (nextmonth == 1 ? yr + 1 : yr);

            for (var i = parseInt(numdays) + parseInt(startindex); i < 42; i++) {
                var cell = $(cells.get(i)).removeClass('chosen');
                var nowDay = i - numdays - startindex + 1;
                var nowVal = nextyear + '-' + $.PadLeft(nextmonth) + '-' + $.PadLeft(nowDay);

                var cellval = ictr.BuildCalendar(nowDay, nowVal, 'prev', cell, ctrID) || '';

                var cellhtml = nowDay;
                if (isDetail) {
                    cellhtml = '<div class="dayinfo"><div class="day1">' + nowDay + '</div><div class="day2">' + _miss_fun.Lunar.getLunarDay(nowVal) + '</div></div><div class="detail">' + cellval + '</div>';
                }
                else if (showLunar) {
                    cellhtml = '<span style="font-weight:bold;">' + nowDay + '</span><br><span style="color:#aaa;">' + _miss_fun.Lunar.getLunarDay(nowVal) + '</span>';
                }
                else if (cellval) {
                    cellhtml = cellval;
                }

                cell.attr('v', nowVal)
                    .attr('d', nowDay)
                    .html(cellhtml)
                    .addClass('disabledate')
                    .blur(function () { $ctr.blur(); })
                    .click(function () {
                        var currentyear = $("span[name=year]", childpicker).text();
                        var currentmonth = $("span[name=month]", childpicker).text();
                        if (currentmonth == 12) {
                            currentmonth = 1;
                            currentyear++;
                        } else {
                            currentmonth++;
                        }

                        chosenValue = new Date(currentyear, currentmonth - 1, $(this).attr('d'));
                        if (pickertype == "datetime") {
                            cells.removeClass('chosen');
                            $(this).addClass('chosen');
                        } else {
                            closeIt();
                        }
                    });
            }
        }

        function loadMonth_time() {
            var h = chosenValue.getHours();
            if (isNaN(h)) h = new Date().getHours();
            var m = chosenValue.getMinutes();
            if (isNaN(m)) m = new Date().getMinutes();

            $('ul[ultype=hour]', childpicker).find('li').each(function (i) {
                if (parseInt($(this).text()) == h) {
                    $(this).addClass('chosen');
                    $(this).parent().parent().scrollTop((i - 3) * 22);
                    return;
                }
            });

            $('ul[ultype=minute]', childpicker).find('li').each(function (i) {
                if (parseInt($(this).text()) == m) {
                    $(this).addClass('chosen');
                    $(this).parent().parent().scrollTop((i - 3) * 22);
                    return;
                }
            });

            $('li', childpicker).off('click').click(function () {
                var $this = $(this);
                $this.parent().find('li').removeClass('chosen');
                $this.addClass('chosen');

                var h = chosenValue.getHours();
                var m = chosenValue.getMinutes();

                if ($this.parent().attr('ultype') == 'hour') {
                    h = $this.text();
                } else {
                    m = $this.text();
                }

                if (isNaN(h)) {
                    h = 0;
                }

                if (isNaN(m)) {
                    m = 1;
                }
                chosenValue = new Date(2016, 1, 1, h, m, 1, 1);
                childpicker.attr('choosentime', getFormattedTime());
            });

            $('span', childpicker).off('click').click(function () {
                if ($(this).attr('now') != null) {
                    chosenValue = new Date();
                    setValue_time();
                }
                else if ($(this).attr('clear') != null) {
                    chosenValue = null;
                    setValue_time();
                }
                else if ($(this).attr('ok') != null) {
                    setValue_time();
                }
                $ctr.removeAttr('childpickerID');
                if (childpicker) childpicker.remove();
                childpicker = null;
                $ctr.focus();
            });
        }

        function loadMonth_Period(e, pickertype) {
            //prevYear, nextYear
            var $year = $("span[name=year]", childpicker);
            var yr = $year.text() * 1 || (new Date().getFullYear());

            if (e && $(e.target).hasClass('prevYear')) {
                yr--;
            } else if (e && $(e.target).hasClass('nextYear')) {
                yr++;
            }
            $year.text(yr);

            $("tbody td", childpicker).unbind('click').removeClass('month').each(function () {
                var cell = $(this).removeClass('chosen');
                if (pickertype !== 'period') cell.css('height', '30px');
                cell.addClass('month').off('click')
                    .click(function () {
                        chosenValue = $year.text() + "-" + $(this).attr('month');
                        closeIt();
                    });
                if (chosenValue.indexOf("-" + cell.attr('month')) > 0) cell.addClass('chosen');
            });
        }

        function closeIt(dateObj) {
            if (dateObj == "0") //不选
            { }
            else {

                var retVal = { v: '', t: '' };
                if (dateObj == "") //清空
                {
                }
                else {
                    if (pickertype.substr(0, 3) == "per") {
                        if (dateObj == "1") //本月
                        {
                            retVal.v = $.formatDate(new Date(), "yyyy-MM");
                            retVal.t = $.formatDate(new Date(), "yyyy-MM")
                        }
                        else {
                            retVal.v = chosenValue;
                            retVal.t = chosenValue
                        }
                    }
                    else if (pickertype == "date") {
                        var FormatStr = $wrap.attr('FormatStr');
                        if (FormatStr == null || FormatStr == "") FormatStr = "yyyy-MM-dd";

                        if (dateObj == "1") //今天
                        {
                            var txtValue = $.formatDate(new Date(), FormatStr);
                            var fullDateValue = $.formatDate(new Date(), 'yyyy-MM-dd');
                            retVal.v = txtValue;
                            retVal.t = fullDateValue
                        } else {
                            var txtValue = $.formatDate(chosenValue, FormatStr);
                            var fullDateValue = $.formatDate(chosenValue, 'yyyy-MM-dd');
                            retVal.v = txtValue;
                            retVal.t = txtValue
                        }
                    }
                    else {
                        var FormatStr = $wrap.attr('FormatStr');
                        if (FormatStr == null || FormatStr == "") FormatStr = "yyyy-MM-dd hh:mm";

                        if (dateObj == "1") //今天
                        {
                            var txtValue = $.formatDate(new Date(), FormatStr);
                            var fullDateValue = $.formatDate(new Date(), 'yyyy-MM-dd hh:mm');
                            retVal.v = txtValue;
                            retVal.t = fullDateValue
                        }
                        else {
                            var selectedhour = $("#_iTextDatetimePicker_Hour", childpicker).ival()
                            var selectedmintue = $("#_iTextDatetimePicker_Minute", childpicker).ival();

                            chosenValue = new Date(chosenValue.getFullYear(), chosenValue.getMonth(), chosenValue.getDate(), selectedhour, selectedmintue);

                            var txtValue = $.formatDate(chosenValue, FormatStr);
                            var fullDateValue = $.formatDate(chosenValue, 'yyyy-MM-dd hh:mm');
                            retVal.v = txtValue;
                            retVal.t = txtValue
                        }
                    }
                }
                if (isCalendar) {
                    $wrap.attr('_rawValue', $wrap.attr('value'));
                    $wrap.attr('value', retVal.v);
                    _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件

                    if (parseInt($("span[name=month]", childpicker).text()) == new Date(retVal.v).getMonth() + 1) {
                        return;
                    }
                    if (pickertype.indexOf('date') >= 0) {
                        var mo = chosenValue.getMonth() + 1;
                        $("span[name=month]", childpicker).text($.PadLeft(mo));
                        $("span[name=year]", childpicker).text(chosenValue.getFullYear());
                    }
                    loadMonth(null);
                    return;
                }
                else {
                    $ctr.val(retVal.v).attr('title', retVal.t);
                    $wrap.attr('_rawValue', $ctr.val());
                    _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件
                }
            }
            if (childpicker) childpicker.remove();
            childpicker = null;
            $ctr.removeAttr('childpickerID').focus();
        }

        function buildselect(ym) {
            var height = childpicker.outerHeight() - 30;
            var h = '<div class="select' + ym + '" style="border:none;width:100%;height:' + height + 'px;position:absolute;top:28px;background:white;">'
                + '<table style="width:100%;height:100%;">';

            if (ym == 'year') {
                var yr = $("span[name=year]", childpicker).text() - 7;
                for (var i = 0; i < 15; i += 3) {
                    h += '<tr><td>' + (yr + i + 0) + '</td><td>' + (yr + i + 1) + '</td><td>' + (yr + i + 2) + '</td>';
                    if (i == 0)
                        h += '<td style="display:table-cell" rowspan=2 class="xiconfont xicon-menuup1 notyear" title="' + lang('上翻', 'page up') + '"></td>';
                    else if (i == 6)
                        h += '<td title="' + lang('今年', 'current year') + '" class="notyear">=</td>';
                    else if (i == 9)
                        h += '<td style="display:table-cell" rowspan=2 class="xiconfont xicon-menudown1 notyear" title="' + lang('下翻', 'page down') + '"></td>';
                    h += '</tr>';
                }
            }
            else {
                for (var i = 1; i <= 12; i += 3) {
                    h += '<tr><td style="font-size: 16px;">' + i + '</td><td style="font-size: 16px;">' + (i + 1) + '</td><td style="font-size: 16px;">' + (i + 2) + '</td></tr>';
                }
            }

            h += '</table>' + '</div>';
            var $h = $(h);
            if (ym == 'year') {
                $h.find('td').off('click').click(function () {
                    if ($(this).hasClass('xiconfont')) {
                        var fy = $h.find('td:first').text() * 1;
                        if ($(this).hasClass('xicon-menuup1'))
                            fy = fy - 15;
                        else fy = fy + 15;
                        $h.find('td:not(.notyear)').each(function () {
                            $(this).text(fy++);
                        });
                    }
                    else {
                        var sy = $(this).text();
                        if (sy === '=') sy = new Date().getFullYear();
                        $("span[name=year]", childpicker).text(sy);
                        $(".selectyear", childpicker).remove();
                        loadMonth();
                    }
                });
            }
            else {
                $h.find('td').off('click').click(function () {
                    $("span[name=month]", childpicker).text($(this).text());
                    loadMonth();
                    $(".selectmonth", childpicker).remove();
                });
            }
            childpicker.append($h);
        }
    },

    iButtonSetParent: function () {
        $('.btn-group-wrap[ParentButtonID]').each(function () {
            var $this = $(this);
            var ParentButtonID = $this.attr('ParentButtonID');
            if (!ParentButtonID) {
                $this.removeAttr('ParentButtonID');
                return true;
            }
            var $m = $('#' + ParentButtonID);
            if ($m.length == 0) {
                $this.removeAttr('ParentButtonID');
                return true;
            }
            $m = $m.parent();
            $this.find('>button').each(function () {
                var $btn = $(this);
                var menuitem = { id: '#' + $btn.attr('id'), title: $btn.find('>span.buttontitle').text() };
                if ($btn.find('>span').length > 1) {
                    menuitem["icon"] = $btn.find('>span:first').attr('class');
                }
                if ($btn.attr('isdisabled') == 'true') {
                    menuitem["disabled"] = true;
                }

                if ($m.find('>span.button').length == 0) {
                    var dm = "<span class='button xiconfont xicon-down' menu-trigger='mouseenter' menu-align='right' menus='" + $.toJsonString([menuitem]) + "' type='button' style='padding:0px 6px;float:right;border-bottom-left-radius:0px;border-top-left-radius:0px;'></span>";
                    $m.append(dm).find('>span.button').iMenus();
                }
                else {
                    var $dm = $m.find('>span.button');
                    var menus = $.JsonObject($dm.attr('menus') || "[]");

                    for (var i = 0; i < menus.length; i++) {
                        if (menus[i]["id"] == menuitem.id) return true;
                    }
                    menus.push(menuitem);
                    $dm.attr('menus', $.toJsonString(menus));
                }
            });
        });
    },

    iButtonSetParentMenuStatus: function ($btn, disabled) {
        if ($btn.parent().attr('ParentButtonID')) {
            var $m = $('#' + $btn.parent().attr('ParentButtonID')).parent().find('>span.button');;
            if ($m.length > 0) {
                var menus = $.JsonObject($m.attr('menus') || "[]");

                var thisID = '#' + $btn.attr('id');
                for (var i = 0; i < menus.length; i++) {
                    if (menus[i]["id"] == thisID) {
                        menus[i]['disabled'] = disabled;
                        break;
                    }
                }
                $m.attr('menus', $.toJsonString(menus));
            }
        }
    },

    InitiSelectDS: function (rawds, extds, excludeKeys, filterkeys, addempty, searchValue) {
        //rawds
        if (!rawds) rawds = [];
        var strrawds = rawds.toString();
        if (strrawds.length > 2) {
            if (strrawds.substr(strrawds.length - 1, 1) == '.') {
                strrawds = strrawds.substr(0, strrawds.length - 1);
                rawds = strrawds;
            }
            if (strrawds.substr(strrawds.length - 1, 1) == '-') {
                strrawds = strrawds.substr(0, strrawds.length - 1);
                rawds = strrawds;
            }
        }
        if (rawds && /\{\{(.*?)\}\}/.test(strrawds)) {
            rawds = []; //待vm处理
        }
        else if (rawds instanceof Array == false) {
            if (rawds) {
                rawds = $.JsonObject(rawds);
            }
            else {
                rawds = [];
            }
        }

        if (addempty === "true" || addempty === true) {
            if (rawds.length === 0) {
                rawds = [['', '', '']];
            }
            else if (rawds[0][0] !== '') {
                rawds.splice(0, 0, ['', '', '']);
            }
        }

        //extds
        if (extds && /\{\{(.*?)\}\}/.test(extds.toString()) === false) {
            var hasDiv = false;
            var isBefore = false;

            var strrawds = extds.toString();
            if (strrawds.length > 2) {
                if (strrawds.substr(strrawds.length - 1, 1) == '.') {
                    strrawds = strrawds.substr(0, strrawds.length - 1);
                    isBefore = true;
                    extds = strrawds;
                }
                if (strrawds.substr(strrawds.length - 1, 1) == '-') {
                    strrawds = strrawds.substr(0, strrawds.length - 1);
                    hasDiv = true;
                    extds = strrawds;
                }
                if (strrawds.substr(strrawds.length - 1, 1) == '.') {
                    strrawds = strrawds.substr(0, strrawds.length - 1);
                    isBefore = true;
                    extds = strrawds;
                }
            }

            if (extds instanceof Array == false) extds = $.JsonObject(extds);

            if (!isBefore) {
                if (hasDiv) rawds.push(['-', '', ''])
                for (var i = 0; i < extds.length; i++) {
                    rawds.push(extds[i]);
                }
            }
            else {
                if (hasDiv) rawds.splice(0, 0, ['-', '', ''])
                for (var i = extds.length - 1; i >= 0; i--) {
                    rawds.splice(0, 0, extds[i]);
                }
            }
        }

        //excludeKeys
        if (excludeKeys && /\{\{(.*?)\}\}/.test(excludeKeys.toString()) === false) {
            excludeKeys = ',' + $.trim(excludeKeys.replace(/\s/g, '')) + ',';
        }
        else {
            excludeKeys = '';
        }

        //filterkeys
        if (filterkeys && /\{\{(.*?)\}\}/.test(filterkeys.toString()) === false) {
            filterkeys = ',' + $.trim(filterkeys.replace(/\s/g, '')) + ',';
        }
        else {
            filterkeys = '';
        }

        searchValue = $.trim(searchValue).toUpperCase();

        var newds = [];
        var isHas = false;
        for (var i = 0; i < rawds.length; i++) {
            var line = rawds[i];
            if (line === undefined) line = ['-', '', ''];
            if (line instanceof Array == false) line = [line];
            var key = line[0].toString();
            var code = '';
            var desc = '';
            if (line.length === 1) {
                code = desc = key;
            }
            else if (line.length === 2) {
                code = key;
                desc = line[1].toString();
            }
            else if (rawds[i].length === 3) {
                code = line[1].toString();
                desc = line[2].toString();
            }
            code = code.replace('#disabled', '');
            desc = desc.replace('#disabled', '');

            if (!searchValue
                || code.toUpperCase().indexOf(searchValue) >= 0 || desc.toUpperCase().indexOf(searchValue) >= 0
                || key == searchValue) {
                isHas = false;
                if (key !== '-') {
                    for (var j = 0; j < newds.length; j++) {
                        if (newds[j][0] === key) {
                            isHas = true;
                            break;
                        }
                    }
                }
                if (!isHas && notExclude(excludeKeys, key) && inFilter(filterkeys, key)) newds.push([key, code, desc]);
            }
        }
        return newds;

        function notExclude(excludeKeys, Key) {
            if (!excludeKeys) return true;
            return excludeKeys.indexOf(',' + Key + ',') < 0;
        }
        function inFilter(filterkeys, Key) {
            if (!filterkeys) return true;
            return filterkeys.indexOf(',' + Key + ',') >= 0;
        }
    },

    BuildiSelectPickerTable: function ($wrap, searchValue) {
        var table = $('<table cellpadding="0" cellspacing="0" style="width:100%"></table>');
        table.append('<tbody></tbody>');

        var key = $wrap.attr('key');
        if (!key) key = '';

        var hasCheckbox = $wrap.attr('multiselect') == 'true';
        var ShowCode = $wrap.attr('showcode') == 'true';

        var ds;
        if ($wrap.attr('searchmode') == "true" && !searchValue)
            ds = [];
        else
            ds = _miss_fun.InitiSelectDS($wrap.attr('ds'), $wrap.attr('extds'), $wrap.attr('excludekeys'), $wrap.attr('filterkeys'), $wrap.attr('addempty'), searchValue);

        var selectedIndex = -1;
        for (var i = 0; i < ds.length; i++) {
            if (ds[i][0] == key) {
                selectedIndex = i;
                break;
            }
        }

        var isMainDiabled = $wrap.attr('isdisabled') == 'true';

        for (var i = 0; i < ds.length; i++) {
            var selected = "";
            if (i == selectedIndex) selected = ' class="chosen"';

            var optkey = ds[i][0];
            var isDisabled = optkey.indexOf('#disabled') >= 0 || isMainDiabled;

            var checkbox = '';
            if (hasCheckbox) {
                if ((',' + key + ',').indexOf(',' + ds[i][0] + ',') >= 0) {
                    checkbox = '<td class="multicheck"><input type="checkbox" checked="checked"' + (isDisabled ? ' disabled="disabled"' : '') + ' /></td>';
                }
                else {
                    checkbox = '<td class="multicheck"><input type="checkbox"' + (isDisabled ? ' disabled="disabled"' : '') + ' /></td>';
                }
            }

            var tdCode = ShowCode ? ('<td>' + ds[i][1] + '</td>') : '';
            if (optkey == "-") {
                var colspan = 1 + (hasCheckbox ? 1 : 0) + (ShowCode ? 1 : 0);
                $("tbody", table).append('<tr><td divider colspan="' + colspan + '"></td></tr>');
            }
            else if (optkey != "" || !hasCheckbox) {
                var optDisabled = '';
                if (isDisabled) {
                    optkey = optkey.replace('#disabled', '');
                    optDisabled = ' style="color:#aaa;" isdisabled="true"';
                }
                $("tbody", table).append('<tr' + optDisabled + selected + ' key="' + optkey + '" code="' + ds[i][1] + '" desc="' + ds[i][2] + '">' + checkbox + tdCode + '<td>' + (ds[i][2] == '' ? '&nbsp;' : ds[i][2]) + '</td></tr>');
            }
        }

        $('td', table).blur(function () { $wrap.find('.ictr-input').blur(); });
        $('tbody tr', table)
            .hover(function () { $(this).addClass('hover'); },
                function () { $(this).removeClass('hover'); })
            .click(function (e) {
                if ($wrap.iDisabled()) return;
                if ($(this).attr('isdisabled') == 'true') return;
                if (checkbox == "") {
                    closeIt($(this));
                }
                else {
                    if (e.target.tagName != "INPUT") {
                        var chk = $(this).find("td>input");
                        chk.prop('checked', chk.prop('checked') == false);
                    }
                    if ($wrap.attr('multiselect') == 'true') {
                        var keys = [], codes = [], descs = [];
                        table.find('tr').each(function () {
                            if ($(this).find("td>input").prop('checked') == true) {
                                keys.push($(this).attr('key'));
                                codes.push($(this).attr('code'));
                                descs.push($(this).attr('desc'));
                            }
                        });
                        var key = keys.join(',');
                        var code = codes.join(',');
                        var desc = descs.join(',');

                        if (key != $wrap.attr('key') || code != $wrap.attr('code') || desc != $wrap.attr('desc')) {
                            $wrap.attr('key', key).attr('code', code).attr('desc', desc);
                            if ($wrap.attr('showaslist') !== "true") $wrap.find('.ictr-input').val(desc).attr('title', code);
                            _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件
                        }
                    }
                }
            })
            .on('touchend', function (e) { $(this).click(e); });

        return table;

        function closeIt(el) {
            $wrap.find('.righticon').removeClass('fa-rotate-180');
            var $ctr = $wrap.find('.ictr-input');

            $wrap.attr('key', el.attr('key')).attr('code', el.attr('code')).attr('desc', el.attr('desc'));
            if ($wrap.attr('showaslist') === "true") {
                $wrap.find('.chosen').removeClass('chosen');
                el.addClass('chosen');
            }
            else {
                $ctr.val(el.attr('desc')).attr('title', el.attr('code'));
                var childpickerID = $ctr.attr('childpickerID');
                if (childpickerID) $('#' + childpickerID).remove();
                $ctr.removeAttr('childpickerID').focus();
            }

            _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件
        }
    },

    showChildpicker: function ($wrap, childpicker, options) {
        //options: isInCtr, offTop, align

        var doc = $wrap[0].ownerDocument;

        if (options && options.isInCtr) {
            $wrap.append(childpicker);
        }
        else {
            $(doc).find("body").prepend(childpicker);
        }
        //childpicker位置
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        var scrollTop = $(doc).scrollTop();
        var pickerHeight = childpicker.outerHeight();
        var pickerWidth = childpicker.outerWidth();

        var poffset = $wrap.offset();
        var dpTop = $wrap.outerHeight() + poffset.top + (options ? (options.offTop || 0) : 1);
        var dpLeft = poffset.left;

        if (dpTop + pickerHeight > windowHeight + scrollTop) dpTop = poffset.top - pickerHeight - 3 + (options && options.isMenu ? 4 : 0);
        if (dpTop < scrollTop) dpTop = scrollTop;
        if (dpLeft + pickerWidth > windowWidth) dpLeft = windowWidth - pickerWidth - 4;


        if (options && options.align === 'right')
            dpLeft = poffset.left + $wrap.outerWidth() - pickerWidth + 11;
        else if (options && options.align === 'center')
            dpLeft = poffset.left - (pickerWidth - $wrap.outerWidth() - 11) / 2;

        if (dpLeft < 0) dpLeft = 0;

        childpicker.offset({ top: dpTop, left: dpLeft }).css('visibility', 'visible');
    },

    iCodeRefresh: function () {
        $('.ictr-wrap[texttype="code"]').each(function () {
            var $this = $(this);
            var insID = $this.attr('_code_editor_instanceid');
            if (insID && window[insID]) window[insID].refresh();
        })
    },

    AutoSizeE9iframe: function (timeout) {
        if (!$.browser.isLandray) return;
        timeout = timeout || 100;
        $.WhenAjaxDone(function () {
            setE9iFrameHeight();
            $.WhenAjaxDone(function () { setE9iFrameHeight() }, 1000);
        }, timeout);

        function setE9iFrameHeight() {
            $('#dvBody').css({ width: '100%', height: 'auto' });
            setTimeout(function () {
                $(window.frameElement).css('min-height', '300px');
                window.frameElement.height = Math.max($('#dvBody').outerHeight() + 20, 200);
            }, 0);
        }
    }

};

/** 返回父页面 window 对象 */
function parentWin() {
    var frm = window.frameElement;
    if (frm && $(frm).attr('ForDialog')) {
        if (window.top.topi9Dialog && window.top.topi9Dialog.length > 0)
            return window.top.topi9Dialog[window.top.topi9Dialog.length - 1].win;
    }
    return window.opener ? window.opener : window.parent;
}

/**
 * 是否是错误（"error:"开头)
 * @param {string} retStr 要检查的文本
 * @returns {boolean}
 */
function isError(retStr) {
    if (retStr == null) return false;
    if (retStr.constructor !== String) return false;
    retStr = ($.trim(retStr) + "       ").toLowerCase();
    if (retStr.substr(0, 6) === "error:" || retStr.substr(0, 6) === "error：")
        return true;
    else
        return false;
}

/** 将字符串中格式化成html：&-&amp;  <-&lt;  >-&gt;  "-&quot;  '-&#39; / /-&nbsp; */
function EncodeHtml(s) {
    if (!s) return "";
    return $.toJsonString(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;").replace(/\'/g, "&#39;").replace(/\"/g, "&quot;");
}

/** 将字符串中格式化成html：&amp;-&  &lt;-<  &gt;->  &quot;-"  &#39;-' &nbsp;-/ /,
 * transRN:是否将\r,\n转换成<br> */
function DecodeHtml(s, transRN) {
    if (!s) return "";
    s = s.toString().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    if (transRN) s = s.replace(/\r\n/g, '<br>').replace(/\r/g, '<br>').replace(/\n/g, '<br>');
    return s;
}

/** 获取URL参数 */
function getUrlArg(sKey) {
    var sParams = location.href;
    sParams = sParams.substring(sParams.indexOf("?") + 1);
    var a = sParams.split('&');

    for (var i = 0; i < a.length; i++) {
        var sKey1 = a[i].substring(0, a[i].indexOf("="));
        var sValue1 = a[i].substring(a[i].indexOf("=") + 1);
        if (sKey1.toLowerCase() === sKey.toLowerCase()) return decodeURIComponent(sValue1);
    }
    return "";
}

/** 尝试从 SessionStorage 中获取值，没有则执行 func 并缓存该值 */
function SessionStorageTryGet(storageKey, func) {
    var ret = window.sessionStorage.getItem(storageKey);
    if (ret) return ret;
    ret = func();
    window.sessionStorage.setItem(storageKey, ret);
    return ret;
}

/**
 * 在主页中打开新的Tab，如当前不在主页环境，则调用openDialog(url, 'full')
 * @param {string} url url
 * @param {string} title Tab标题
 */
function openNewTab(url, title, _callbackFun, para) {
    if ($.browser.isPhone) {
        openDialog(url, _callbackFun, para);
        return;
    }
    if (window.top && window.top.setMenuStatus && window.top.AddTab) {
        if (url.indexOf('https:') !== 0 && url.indexOf('http:') !== 0 && url.substring(0, 1) !== "/") {
            var thisPagehref = location.href;
            var lastindext = thisPagehref.lastIndexOf('/');
            url = thisPagehref.substr(0, lastindext) + "/" + url;
        }
        url += (url.indexOf("?") < 0 ? "?" : "&") + "temp=" + Math.random().toString().replace(".", "");

        if (!window.top.topi9TabCallbackFun) window.top.topi9TabCallbackFun = {};
        if (_callbackFun) window.top.topi9TabCallbackFun[url] = { win: window, cb: _callbackFun, para: para };
        var relamid = '';
        if (window.frameElement) {
            var $iframeobj = $(window.frameElement);
            if ($iframeobj.hasClass('tabpanelfrm') && $iframeobj.parent().attr('mid')) {
                relamid = $(window.frameElement).parent().attr('mid');
            }
        }
        window.top.AddTab(null, url, title, relamid);
    } else if (window.top && window.top.AddTab && window.localStorage.getItem("defaultTheme").indexOf("v2") > -1) {
        if (url.indexOf('https:') !== 0 && url.indexOf('http:') !== 0 && url.substring(0, 1) !== "/") {
            var thisPagehref = location.href;
            var lastindext = thisPagehref.lastIndexOf('/');
            url = thisPagehref.substr(0, lastindext) + "/" + url;
        }
        url += (url.indexOf("?") < 0 ? "?" : "&") + "temp=" + Math.random().toString().replace(".", "");
        if (!window.top.topi9TabCallbackFun) window.top.topi9TabCallbackFun = {};
        if (_callbackFun) window.top.topi9TabCallbackFun[url] = { win: window, cb: _callbackFun, para: para };
        var relamid = '';
        if (window.frameElement) {
            var $iframeobj = $(window.frameElement);
            if ($iframeobj.hasClass('tabpanelfrm') && $iframeobj.parent().attr('mid')) {
                relamid = $(window.frameElement).parent().attr('mid');
            }
        }
        window.top.AddTab(null, url, title, relamid);
    }
    else {
        openDialog(url, 'full', _callbackFun, para);
    }
}

/**
 * 打开弹出框
 * @param {string} url url
 * @param {number=} width 窗口宽度（可选）number | {width:xx, height:xx, max:true, resize:true, choose:true, title:''} | full, max, notmax, choose
 * @param {number=} height 窗口高度（可选）
 * @param {function=} _callbackFun 回调函数
 * @param {any=} para 回传入_callback的参数
 */
function openDialog(url, width, height, _callbackFun, para) {
    var maxbutton = true;
    var canresize = true;
    var choose = false;
    var title = '&nbsp;';
    if (width && width.constructor === Object) {
        if (height && height.constructor === Function) {
            if (arguments.length === 4) para = _callbackFun;
            _callbackFun = height;
        }
        if (width.height !== undefined)
            height = width.height;
        else
            height = 0;
        if (width.max !== undefined) maxbutton = !!width.max;
        if (width.resize !== undefined) canresize = !!width.resize;
        if (width.choose !== undefined) choose = !!width.choose;
        title = width.title || width.Title || '&nbsp;';
        if (width.width !== undefined)
            width = width.width;
        else
            width = 0;
    }
    else if (width && width.constructor === Function) {
        if (arguments.length === 3) para = height;
        _callbackFun = width;
        width = 0;
        height = 0;
    }
    else if (height && height.constructor === Function) {
        if (arguments.length === 4) para = _callbackFun;
        _callbackFun = height;
        height = 0;
    }

    //将回调函数及参数压入top的数组中
    if (!window.top.topi9Dialog || window.top.topi9Dialog.length === 0) window.top.topi9Dialog = [];
    window.top.topi9Dialog.push({ cb: _callbackFun, para: para, win: window });

    var $topWinbody = $(window.top.document.body);

    var i9DialogZindex = $topWinbody.attr('i9DialogZindex');
    if (!i9DialogZindex) {
        i9DialogZindex = 980000;
        $topWinbody.attr('i9DialogZindex', i9DialogZindex + 2);
    }
    else {
        $topWinbody.attr('i9DialogZindex', parseInt(i9DialogZindex) + 2);
    }
    var _maskDivZ_index = parseInt(i9DialogZindex);
    var dialogZindex = parseInt(i9DialogZindex) + 1;

    var s_random = Math.random().toString().replace(".", "");
    var dialogID = "DialDiv_" + s_random;
    var frameID = "FramDiv_" + s_random;

    var maskID = "MaskDiv_i9Dialog";
    if ($topWinbody.find('#MaskDiv_i9Dialog').length == 0) {
        var maskDiv = "<div id='" + maskID + "' style='z-index:" + _maskDivZ_index + "' maskLayer=1 class='maskdiv'></div>";
        $topWinbody.append(maskDiv);
    }
    else {
        var maskLayer = $topWinbody.find('#MaskDiv_i9Dialog').attr('maskLayer');
        maskLayer = parseInt(maskLayer) + 1;
        $topWinbody.find('#MaskDiv_i9Dialog').css('z-index', _maskDivZ_index).attr('maskLayer', maskLayer);
    }

    if (url.indexOf('https:') !== 0 && url.indexOf('http:') !== 0) {
        var thisPagehref = location.href;
        if (url.substring(0, 1) !== "/" && url.substring(0, 1) !== "\\") {
            var lastindext = thisPagehref.lastIndexOf('/');
            url = thisPagehref.substr(0, lastindext) + "/" + url;
        }
        else {
            var lastindext = thisPagehref.indexOf('/', 8)
            url = thisPagehref.substr(0, lastindext) + url;
        }
    }

    url += (url.indexOf("?") < 0 ? "?" : "&") + "temp=" + s_random;

    var allheight = window.top.innerHeight;
    var allwidth = window.top.innerWidth;
    var DialogLeft = '0px';
    var DialogTop = '0px';

    var isFull = width === 'full' || $.browser.isPhone;
    var autosize = "";
    if (width === 'notmax' || width === 'max') {
        maxbutton = width === 'max';
        width = '';
    }
    if (width === 'choose') {
        choose = true;
        width = '';
    }
    if (isFull) {
        width = allwidth;
        height = allheight;
        autosize = '';
    }
    else {
        if (!width || width === '0') autosize += "w";
        if (!height || height === '0') autosize += "h";
        width = parseFloat(width || 0);
        height = parseFloat(height || 0);
        if (width + 10 > allwidth) width = allwidth;
        if (width < 35) width = 35;
        if (height > allheight) height = allheight;
        if (height < 28) height = 28;

        DialogLeft = (allwidth - width) / 2 + 'px';
        DialogTop = (allheight - height) / 2 + 'px';
    }
    width = width + 'px';
    height = height + 'px';

    var formLoadingcss = autosize == "wh" ? " formLoading" : "";

    var dialogDiv = "<div id='" + dialogID + "' canresize='" + (canresize ? "true" : "false")
        + "' style='z-index:" + dialogZindex + ";width:" + width + ";height:" + height + ";top:" + DialogTop + ";left:" + DialogLeft + "'"
        + " class='dialogDiv" + ($.browser.isPhone ? " smartphone" + (choose ? " choose" : "") : "") + (isFull ? " MaxForm" : (" border" + formLoadingcss)) + "'>";
    dialogDiv += "<div class='dialogloadding'></div>";
    dialogDiv += "<div class='dialog_title'><div class='titleText'>" + title + "</div>";
    if (!$.browser.isPhone) {
        dialogDiv += "<div class='help-btn svg-icon svg-help'>" +
            "<svg width=\"14\" height=\"14\" viewBox=\"0 0 48 48\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z\" fill=\"none\" fill-class=\"fill-color-1\" stroke=\"black\" stroke-class=\"stroke-color-0\" stroke-width=\"2\" stroke-linejoin=\"round\"/><path d=\"M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248\" stroke=\"black\" stroke-class=\"stroke-color-2\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M24 37.6248C25.3807 37.6248 26.5 36.5055 26.5 35.1248C26.5 33.7441 25.3807 32.6248 24 32.6248C22.6193 32.6248 21.5 33.7441 21.5 35.1248C21.5 36.5055 22.6193 37.6248 24 37.6248Z\" fill=\"black\" fill-class==\"fill-color-2\"/></svg>" +
            "</div>";
    }

    if (!isFull && maxbutton && maxbutton !== "false" && maxbutton !== "0") {
        dialogDiv += "<div class='maxdialog resizeform' title='" + lang('最大化', 'Maximum') + "'></div>";
    }
    dialogDiv += "<div class='closedialog' title='" + lang(15) + "'></div>";
    if ($.browser.isPhone) {
        dialogDiv += "<div class='dialogreturn'>" + (choose ? lang("取消", "CANCEL") : lang("返回", "RETURN")) + "</div>";
        dialogDiv += "<div class='dialogok'>" + lang("确定", "OK") + "</div>";
    }

    dialogDiv += "</div> ";
    dialogDiv += "<div class='dialogContent'" + (isFull ? " style='padding:0px;'" : "") + "><iframe id='" + frameID + "' ForDialog='true' frameborder='0' autosize='" + autosize + "'></iframe></div>";
    dialogDiv += "</div>";
    $topWinbody.append(dialogDiv); //src = '" + url + "'
    var oFrm = window.top.document.getElementById(frameID);
    $(oFrm).attr('src', url);

    oFrm.onload = oFrm.onreadystatechange = function () {
        if (this.readyState && this.readyState !== 'complete') return;
        $topWinbody.find('#' + dialogID).removeClass("formLoading").find('.dialogloadding').remove();
        try {
            if (oFrm.contentWindow.document.title) $topWinbody.find('#' + dialogID).find('.titleText').text(oFrm.contentWindow.document.title);
            $(oFrm.contentWindow.document.body).focus();
        } catch (ex) { }

        setTimeout(function () {
            if ($(oFrm).width() < 35) {
                var DialogLeft = (window.top.document.documentElement.clientWidth - 700) / 2 + 'px';
                var DialogTop = (window.top.document.documentElement.clientHeight - 550) / 2 + 'px';
                $(oFrm).parent().parent().css({ height: '550px', width: '700px', 'left': DialogLeft, 'top': DialogTop });
            }
        }, 1000);
    };

    setTimeout(function () { $topWinbody.find('#' + dialogID).removeClass("formLoading"); }, 4000);

    if (!isFull) _miss_fun.SetDialogMoveable(dialogID);

    //插入Close按钮到TopWin stack
    if (!window.top.topi9DialogClose || window.top.topi9DialogClose.length === 0) window.top.topi9DialogClose = [];
    window.top.topi9DialogClose.push($topWinbody.find('#' + dialogID).find('.closedialog'));

    //关闭弹出框
    $topWinbody.find('#' + dialogID).find('.closedialog').click(function () {
        window.top.document.removeEventListener('scroll', window.top._i9DialogscrollEvent, false);
        window.top.document.removeEventListener('mousewheel', window.top._i9DialogmousewheelEvent, false);
        window.top.topi9DialogClose.pop();
        var cbargs = window.top.topi9Dialog.pop();
        if (cbargs && cbargs.cb) try { cbargs.cb.call(cbargs.win, null, cbargs.para); } catch (ex) { console.error(ex); }

        var $topWinbody = $(window.top.document.body);
        var $mask = $topWinbody.find('#MaskDiv_i9Dialog');
        var maskLayer = $mask.attr('maskLayer');
        maskLayer = parseInt(maskLayer) - 1;
        if (maskLayer === 0) {
            $mask.remove();
        }
        else {
            var myZindex = $topWinbody.find('#' + dialogID).css('z-index');
            myZindex = parseInt(myZindex) - 3;
            $mask.css('z-index', myZindex).attr('maskLayer', maskLayer);
        }
        var i9DialogZindex = parseInt($topWinbody.attr('i9DialogZindex'));
        $topWinbody.attr('i9DialogZindex', i9DialogZindex - 2).find('#' + dialogID).html('').css('background-color', 'white').zoomClose();
    });
    //OK按键
    $topWinbody.find('#' + dialogID).find('.dialogok').click(function () {
        var frm = $(this).parent().parent().find('.dialogContent>iframe')[0];
        var frmWin = frm.contentWindow;
        if (!frmWin) return;

        if ("oktapped" in frmWin) {
            frmWin.oktapped();
            return;
        }

        var $btnOK = $(frm.contentDocument).find('#btnOK');
        if ($btnOK.length == 1) $btnOK.click();
    });
    //最大化弹出框
    $topWinbody.find('#' + dialogID).find('.resizeform').click(function () {
        var $this = $(this);
        var $dlg = $this.parent().parent();
        if ($this.hasClass('maxdialog')) {
            $this.removeClass('maxdialog').addClass('middialog').attr('title', '还原(Restore)');
            $dlg.addClass('MaxForm');
        }
        else {
            $this.removeClass('middialog').addClass('maxdialog').attr('title', '最大化(Max)');
            $dlg.removeClass('MaxForm');
        }
    });
    //标题双击
    $topWinbody.find('#' + dialogID).find('.dialog_title').dblclick(function () {
        $(this).find('.resizeform').click();
    });
    //帮助
    $topWinbody.find('#' + dialogID).find('.help-btn').click(function () {
        //帮助逻辑
        var page = svr._currentAssembly;
        if (page && page.indexOf(',') > 0) page = page.substr(0, page.indexOf(','));
        helpurl = '/Common/Help?ID=' + _miss_fun._HelpID + '&Page=' + page;
        open(helpurl);
    });
}

/** 关闭弹出框 */
function closeDialog(retValue) {
    if (!window.frameElement) {
        window.close();
        return;
    }
    var $iframeobj = $(window.frameElement);
    if ($iframeobj.hasClass('tabpanelfrm') && $iframeobj.parent().attr('mid') && window.top.RemoveTab) {
        if (window.top.topi9TabCallbackFun) {
            var src = $iframeobj.attr('src');
            var cbargs = window.top.topi9TabCallbackFun[src];
            if (cbargs && cbargs.cb) {
                try { cbargs.cb.call(cbargs.win, retValue, cbargs.para); } catch (eeee) { console.error(eeee); }
                delete window.top.topi9TabCallbackFun[src];
            }
        }
        window.top.RemoveTab($iframeobj.parent().attr('mid'));
        return;
    }

    if ($iframeobj.hasClass('appportalfrm')) {
        app.invoke('closepage');
        return;
    }

    if (!window.top.topi9Dialog) return;

    window.top.document.removeEventListener('scroll', window.top._i9DialogscrollEvent, false);
    window.top.document.removeEventListener('mousewheel', window.top._i9DialogmousewheelEvent, false);

    var iframeID = $iframeobj.attr('ID');
    var dialogID = "";
    if (iframeID) dialogID = iframeID.replace('FramDiv_', "DialDiv_");

    var $topWinbody = $(window.top.document.body);
    var $mask = $topWinbody.find('#MaskDiv_i9Dialog');
    var maskLayer = $mask.attr('maskLayer');
    maskLayer = parseInt(maskLayer) - 1;
    if (maskLayer === 0) {
        $mask.remove();
    }
    else {
        var myZindex = $topWinbody.find('#' + dialogID).css('z-index');
        myZindex = parseInt(myZindex) - 3;
        $mask.css('z-index', myZindex).attr('maskLayer', maskLayer);
    }

    var i9DialogZindex = $topWinbody.attr('i9DialogZindex');
    $topWinbody.attr('i9DialogZindex', parseInt(i9DialogZindex) - 2);

    if (window.top.topi9DialogClose) window.top.topi9DialogClose.pop();
    var cbargs = window.top.topi9Dialog.pop();
    if (cbargs && cbargs.cb) try { cbargs.cb.call(cbargs.win, retValue, cbargs.para); } catch (eeee) { console.error(eeee); }

    try { $(window).unload(); } catch (ex) { }
    $('body').html('');
    if ($.fn.zoomClose)
        $topWinbody.find('#' + dialogID).zoomClose();
    else
        $topWinbody.find('#' + dialogID).remove();
}

/**
 * 打开Miss Confirm对话框
 * 1. 文本
 * 2. {title:"标题", items:[ctr1, ctr2]}
 *    ret = {a:1, b:'abc'}
 * 3. {title:"标题", items:"string/int/decimal/datetime/date/period/editor/textarea"}, fun:function(){}, retfun:function(ret){} }
 * 4. {title:"标题"}, fun:function(){}, retfun:function(ret){} }
 *    ret = 单值
 * @param {string|{}} content 文本内容
 * 1. 文本
 * 2. {title:"标题", items:[ctr1, ctr2], fun:function(){}, retfun:function(ret){} }
 *    ret = {a:1, b:'abc'}
 * 3. {title:"标题", items:"string/int/decimal/datetime/date/period/editor/textarea"}, fun:function(){}, retfun:function(ret){} }
 * 4. {title:"标题"}, fun:function(){}, retfun:function(ret){} }
 *    ret = 单值
 * @param {function} _callbackFun 回调函数（返回 true, false)
 * @param {any} para 带入的参数，带回到回调函数 也可定义成按钮样式：{ oktitle, okdisabled, canceltitle, canceldisabled }
 */
function openConfirm(content, _callbackFun, para) {
    if (content && content.constructor === Object) {
        openDialog('/html/openConfirmPage.html', _callbackFun, content);
        return;
    }

    var oktitle = lang('确认', 'Confirm');
    var okdisabled = "";
    var canceltitle = lang(12);
    var canceldisabled = "";

    if (para && para.constructor === Object
        && (para.oktitle || para.okdisabled || para.canceltitle || para.canceldisabled)) {
        if (para.oktitle) oktitle = para.oktitle;
        if (para.okdisabled) okdisabled = " disabled='disabled'";
        if (para.canceltitle) canceltitle = para.canceltitle;
        if (para.canceldisabled) canceldisabled = " disabled='disabled'";
        para = null;
    }

    //将回调函数及参数压入top的数组中
    if (!window.top.topi9Dialog || window.top.topi9Dialog.length === 0) window.top.topi9Dialog = [];
    window.top.topi9Dialog.push({ cb: _callbackFun, para: para });

    var $topWinbody = $(window.top.document.body);
    var i9DialogZindex = $topWinbody.attr('i9DialogZindex');
    if (!i9DialogZindex) {
        i9DialogZindex = 980000;
        $topWinbody.attr('i9DialogZindex', i9DialogZindex + 2);
    }
    else {
        $topWinbody.attr('i9DialogZindex', parseInt(i9DialogZindex) + 2);
    }
    var _maskDivZ_index = parseInt(i9DialogZindex.toString());
    var dialogZindex = parseInt(i9DialogZindex.toString()) + 1;

    var s_random = Math.random().toString().replace(".", "");
    var dialogID = "DialDiv_" + s_random;

    var maskID = "MaskDiv_i9Dialog";
    if ($topWinbody.find('#MaskDiv_i9Dialog').length == 0) {
        var maskDiv = "<div id='" + maskID + "' style='z-index:" + _maskDivZ_index + "' maskLayer=1 class='maskdiv'></div>";
        $topWinbody.append(maskDiv);
    }
    else {
        var maskLayer = $topWinbody.find('#MaskDiv_i9Dialog').attr('maskLayer');
        maskLayer = parseInt(maskLayer) + 1;
        $topWinbody.find('#MaskDiv_i9Dialog').css('z-index', _maskDivZ_index).attr('maskLayer', maskLayer);
    }

    if (!content) content = lang(55);

    var dialogDiv = "<div id='" + dialogID + "' canresize='true' style='z-index:" + dialogZindex + ";width:344px;padding-bottom:45px;' class='dialogDiv border'>";
    dialogDiv += "<div class='dialog_title'><div class='titleText'>" + lang(11) + "</div><div class='closedialog' title='" + lang(15) + "'></div></div>";
    dialogDiv += "<div class='dialogContent' style='padding:20px; height:auto;padding-left:92px;'>";

    dialogDiv += '<div class="icon questionicon"></div>';
    dialogDiv += '<div class="contentText">' + content + '</div>';

    dialogDiv += "</div>";
    dialogDiv += "<div class='dialogOperate'>";
    dialogDiv += '<button type="button" class="btnOk"' + okdisabled + '><span class="svg-icon svg-file-success" style="padding-right:6px;"></span>' + oktitle + '</button>&nbsp;&nbsp;&nbsp;&nbsp;';
    dialogDiv += '<button type="button" class="btnCancel"' + canceldisabled + '><span class="svg-icon svg-close" style="padding-right:6px;"></span>' + canceltitle + '</button>';
    dialogDiv += "</div>";
    dialogDiv += "</div>";

    var $dlg = $(dialogDiv).zoomOpen({ $parent: $topWinbody }, function () {

        var txtheight = $dlg.find('.contentText').outerHeight();
        if (txtheight > 36) {
            $dlg.find('.icon').css('margin-top', '0px');
            $dlg.find('.dialogContent').css('padding-top', '20px');
        }
        else if (txtheight > 20) {
            $dlg.find('.icon').css('margin-top', '-5px');
            $dlg.find('.dialogContent').css('padding-top', '25px');
        }
        else {
            $dlg.find('.icon').css('margin-top', '-13px');
            $dlg.find('.dialogContent').css('padding-top', '33px');
        }

        $dlg.iControls();
        _miss_fun.SetDialogMoveable(dialogID);
        $dlg.outerHeight($dlg.outerHeight());
        $dlg.find('.dialogContent').css('height', '100%');
        $dlg.find('.contentText').css({ height: '100%', 'max-height': 'none' });
    });

    //插入Close按钮到TopWin stack
    if (!window.top.topi9DialogClose || window.top.topi9DialogClose.length === 0) window.top.topi9DialogClose = [];
    window.top.topi9DialogClose.push($dlg.find('.closedialog'));

    //关闭弹出框
    $dlg.find('.closedialog').click(function () {
        closeConfirm(dialogID, false);
    });
    $dlg.find('.btnCancel').focus().click(function () {
        closeConfirm(dialogID, false);
    });
    $dlg.find('.btnOk').click(function () {
        closeConfirm(dialogID, true);
    });
    //关闭确认框
    function closeConfirm(dialogID, retValue) {
        window.top.document.removeEventListener('scroll', window.top._i9DialogscrollEvent, false);
        window.top.document.removeEventListener('mousewheel', window.top._i9DialogmousewheelEvent, false);

        var maskLayer = $topWinbody.find('#MaskDiv_i9Dialog').attr('maskLayer');
        maskLayer = parseInt(maskLayer) - 1;
        if (maskLayer === 0) {
            $topWinbody.find('#MaskDiv_i9Dialog').remove();
        }
        else {
            var myZindex = $topWinbody.find('#' + dialogID).css('z-index');
            myZindex = parseInt(myZindex) - 3;
            $topWinbody.find('#MaskDiv_i9Dialog').css('z-index', myZindex).attr('maskLayer', maskLayer);
        }
        var i9DialogZindex = $topWinbody.attr('i9DialogZindex');
        $topWinbody.attr('i9DialogZindex', parseInt(i9DialogZindex) - 2);

        $topWinbody.find('#' + dialogID).zoomClose();

        window.top.topi9DialogClose.pop();
        var cbargs = window.top.topi9Dialog.pop();
        var callbackfun = cbargs.cb;
        if (callbackfun) {
            setTimeout(function () { callbackfun.call(window, retValue, cbargs.para); }, 500);
        }
    }
}

/**
 * 弹出消息框（在底部渐显渐消）
 * 可选: ok, error, warning, success, none)
 * 默认: ok
 * success=中间大图标
 * @param {string} text 消息文本
 * @param {'ok'|'error'|'warning'|'success'|'none'} messageType 消息类型
 * @param {Number} showTime 毫秒后关闭
 */
function openToast(text, messageType, showTime) {
    var dialogID = "MessageDiv_" + Math.random().toString().replace(".", "");

    var dialogDiv = "<div id=\"" + dialogID + "\" class=\"messageDiv shadow rounded\" style=\"";

    if (arguments == 2 && messageType && /^[0-9]+$/.test(messageType)) {
        showTime = messageType;
        messageType = "";
    }

    if (messageType === "error")
        dialogDiv += 'color:white; background-color:#004000;';
    else if (messageType === "warning")
        dialogDiv += 'color:#400080; background-color:yellow;';
    else
        dialogDiv += 'color:white;';

    if ($.browser.isPhone) dialogDiv += "font-size:12px; font-weight:100;"
    dialogDiv += '">';

    if (messageType === "error")
        dialogDiv += '<div class="xiconfont xicon-cancel" style="color:yellow;"></div>';
    else if (messageType === "warning")
        dialogDiv += '<div class="xiconfont warning" style="color:red;"></div>';
    else if (messageType === "ok" || messageType === "success")
        dialogDiv += '<div class="xiconfont xicon-ok" style="color:#00FF00;"></div>';

    dialogDiv += text;
    dialogDiv += "</div>";

    showTime = showTime || 2200;

    dialogDiv += '<script id="js_' + dialogID + '">';
    dialogDiv += 'setTimeout(function () {';
    dialogDiv += 'var $dlg = $("#' + dialogID + '").fadeOut();';
    dialogDiv += 'setTimeout(function () { $dlg.remove(); $("#js_' + dialogID + '").remove();}, 300);';
    dialogDiv += '}, ' + showTime + ');';
    dialogDiv += '</script>';

    $(window.top.document.body).append(dialogDiv);
    var $dlg = $(window.top.document).find('#' + dialogID);

    if (messageType === 'success') {
        $dlg.css({
            'color': 'white', 'width': '120px', 'height': '120px', 'padding-top': '85px', 'text-align': 'center',
            'line-height': '20px', 'word-break': 'break-all',
            'top': ((window.top.innerHeight - 120) / 2) + 'px'
        });
        $dlg.find('>div.xiconfont').css({ 'color': 'white', 'float': 'left', 'font-size': '45px', 'margin-top': '-60px', 'margin-left': '15px' });
    }

    $dlg.css('left', ((window.top.innerWidth - $dlg.outerWidth()) / 2) + 'px').fadeIn();
}

/**
 * 打开Miss Alert对话框
 * @param {string|{}} text 提示的内容（文本 或 HTML)
 * 或参数: {width, height, icon, html, title, buttonTitle, closetime}
 * icon: warning, question, error, info / none
 * @param {function=} _callbackFun 回调函数
 * @param {Integer=} closeTime 延迟N豪秒后自动关闭(text为参数时忽略)
 */
function openAlert(text, _callbackFun, closeTime) {
    if (typeof _callbackFun !== "function") {
        closeTime = _callbackFun;
        _callbackFun = null;
    }

    var width = 344;
    var height = 0;
    var icon = 'warning';
    var html = text;
    var title = lang(21); //提示
    var buttonTitle = lang(11); //确定

    if (text && text.constructor === Object) {
        if (text.width) width = text.width;
        if (text.height) height = parseFloat(text.height) - 75;
        if (text.html) html = text.html;
        if (text.icon) {
            if (text.icon === 'none')
                icon = '';
            else
                icon = text.icon;
        }
        if (text.closetime) closeTime = text.closetime;
        if (text.title) title = text.title;
        if (text.buttontitle) buttonTitle = text.buttontitle;
    }
    else if (text && (text + '').length > 100) {
        width = 544;
        height = 300;
    }

    if (width > innerWidth && innerWidth > 0) width = innerWidth;
    if (height > innerHeight && innerHeight > 0) height = innerHeight;

    html = (html || '').toString().replace(/\n/g, '</ br>');

    var $topWinbody = $(window.top.document.body);

    //将回调函数及参数压入top的数组中
    if (!window.top.topi9Dialog || window.top.topi9Dialog.length === 0) window.top.topi9Dialog = [];
    window.top.topi9Dialog.push(_callbackFun);

    var i9DialogZindex = $topWinbody.attr('i9DialogZindex');
    if (!i9DialogZindex) {
        i9DialogZindex = 980000;
        $topWinbody.attr('i9DialogZindex', i9DialogZindex + 2);
    }
    else {
        $topWinbody.attr('i9DialogZindex', parseInt(i9DialogZindex) + 2);
    }
    var _maskDivZ_index = parseInt(i9DialogZindex.toString());
    var dialogZindex = parseInt(i9DialogZindex.toString()) + 1;

    var s_random = Math.random().toString().replace(".", "");
    var dialogID = "DialDiv_" + s_random;

    var maskID = "MaskDiv_i9Dialog";
    if ($topWinbody.find('#MaskDiv_i9Dialog').length === 0) {
        var maskDiv = "<div id='" + maskID + "' style='z-index:" + _maskDivZ_index + "' maskLayer=1 class='maskdiv'></div>";
        $topWinbody.append(maskDiv);
    }
    else {
        var maskLayer = $topWinbody.find('#MaskDiv_i9Dialog').attr('maskLayer');
        maskLayer = parseInt(maskLayer) + 1;
        $topWinbody.find('#MaskDiv_i9Dialog').css('z-index', _maskDivZ_index).attr('maskLayer', maskLayer);
    }

    var dialogDiv = "<div id='" + dialogID + "' canresize='true' style='z-index:" + dialogZindex + ";width:" + width + "px;padding-bottom:45px;" +
        "' class='dialogDiv border'>" +
        "<div class='dialog_title'><div class='titleText'>" + title + "</div><div class='closedialog' title='" + lang(15) + "'></div></div>" +
        "<div class='dialogContent' style='padding:20px 20px 20px " + (icon ? "92" : "20") + "px;" + (height ? "height:" + height + "px" : "height:auto;") + "'>";
    if (icon) {
        dialogDiv += "<div class='icon " + icon + "icon'></div>";
    }
    dialogDiv += "<div class='contentText' style='" + (height ? "max-height:none; height:100%;" : "") + "'>" + html + "</div>" +
        "</div>" +
        "<div class='dialogOperate'>" +
        "<button type='button' class='btnOk' style='min-width:120px; width:auto;'><span class='svg-icon svg-check' style='padding-right:6px;'></span><span class='oktitle' btntitle='" + (EncodeHtml(buttonTitle)) + "'>" + buttonTitle + "</span></button>" +
        "</div></div>";

    var $dlg = $(dialogDiv).zoomOpen({ $parent: $topWinbody }, function () {
        _miss_fun.SetDialogMoveable(dialogID);

        var txtheight = $dlg.find('.contentText').outerHeight();
        if (txtheight > 36) {
            $dlg.find('.icon').css('margin-top', '0px');
            $dlg.find('.dialogContent').css('padding-top', '20px');
        }
        else if (txtheight > 20) {
            $dlg.find('.icon').css('margin-top', '-5px');
            $dlg.find('.dialogContent').css('padding-top', '25px');
        }
        else {
            $dlg.find('.icon').css('margin-top', '-13px');
            $dlg.find('.dialogContent').css('padding-top', '33px');
        }

        $dlg.outerHeight($dlg.outerHeight());
        $dlg.find('.dialogContent').css('height', '100%');
        $dlg.find('.contentText').css({ height: '100%', 'max-height': 'none' });
    });

    //插入Close按钮到TopWin stack
    if (!window.top.topi9DialogClose || window.top.topi9DialogClose.length === 0) window.top.topi9DialogClose = [];
    window.top.topi9DialogClose.push($topWinbody.find('#' + dialogID).find('.closedialog'));

    //关闭弹出框
    $dlg.find('.closedialog').click(function () { closeAlert(dialogID); });
    $dlg.find('.btnOk').focus().click(function () { closeAlert(dialogID); });
    if (closeTime) {
        var btntitle = $dlg.find('.oktitle').attr('btntitle');
        $dlg.find('.oktitle').text(btntitle + '（' + (closeTime / 1000).toString() + "）");
        var _closeAlertInterval = setInterval(function () {
            closeTime -= 1000;
            if (closeTime <= -1000) {
                closeAlert(dialogID);
                if (_closeAlertInterval) clearInterval(_closeAlertInterval);
            }
            else
                $dlg.find('.oktitle').text(btntitle + '（' + (closeTime / 1000).toString() + "）");
        }, 1000);
    }
    return $dlg;

    function closeAlert(dialogID) {
        window.top.document.removeEventListener('scroll', window.top._i9DialogscrollEvent, false);
        window.top.document.removeEventListener('mousewheel', window.top._i9DialogmousewheelEvent, false);

        if ($topWinbody.find('#' + dialogID).length == 0) return;
        var maskLayer = $topWinbody.find('#MaskDiv_i9Dialog').attr('maskLayer');
        maskLayer = parseInt(maskLayer) - 1;
        if (maskLayer === 0) {
            $topWinbody.find('#MaskDiv_i9Dialog').remove();
        }
        else {
            var myZindex = $topWinbody.find('#' + dialogID).css('z-index');
            myZindex = parseInt(myZindex) - 3;
            $topWinbody.find('#MaskDiv_i9Dialog').css('z-index', myZindex).attr('maskLayer', maskLayer);
        }

        $topWinbody.find('#' + dialogID).zoomClose();

        window.top.topi9DialogClose.pop();
        var callbackfun = window.top.topi9Dialog.pop();
        if (callbackfun && callbackfun.call && callbackfun.call.constructor == Function) setTimeout(function () { callbackfun.call(window); }, 500);

        var i9DialogZindex = $topWinbody.attr('i9DialogZindex');
        $topWinbody.attr('i9DialogZindex', parseInt(i9DialogZindex) - 2);
    }
}

function openNotify(text, title, seconds, callback) {
    if (title && !seconds && title.constructor === Number) {
        seconds = title;
        title = null;
    }
    title = title || lang('系统消息', 'System Message');
    var html = '<div class="iNotify">' +
        '<div class="iNotify-title">' + title + '<div class="iNotify-close">-</div></div>' +
        '<div class="iNotify-content">' + text + '</div>' +
        '</div>';
    var $n = $(html);
    var doc = $(window.top.document.body);
    doc.find('.iNotify').remove();
    doc.append($n);
    $n.css('bottom', '-235px');
    $n.css('bottom');
    $n.css('bottom', '4px');
    $n.find('.iNotify-title,.iNotify-content').click(function () { closeNotify(); });

    if (seconds) {
        setTimeout(function () { closeNotify(); }, (seconds + 1) * 1000);
    }
    function closeNotify() {
        $n.css('bottom', '-400px');
        setTimeout(function () {
            $n.remove();
            callback && callback();
        }, 600);
    }
}

/**
 * 显示Loading
 * @param {string} loadingText loading 文本
 */
function openLoading(loadingText) {
    if (!loadingText) loadingText = "Loading";
    if ($('.loading-mask').length === 0) {
        $('body').append('<div class="loading-mask"><div class="loading-txt"><div><img src="/Images/Common/Info/loading1.gif" /></div><div class="txt">' + loadingText + '&nbsp;...</div></div></div>');
        var lwidth = $('.loading-mask>.loading-txt').outerWidth();
        $('.loading-mask>.loading-txt').css({ 'margin-top': (innerHeight - 50) / 2 + 'px', 'margin-left': (innerWidth - lwidth) / 2 + 'px' })
    }
    else {
        $('.loading-mask>.loading-txt>.txt').text(loadingText + ' ...');
    }
}
/**
 * 关闭Loading (如果传入成功文本，则显示成功完成1.5秒)
 * @param {string} successText loading 文本
 */
function closeLoading(successText) {
    if (arguments.length > 0) {
        if (!successText || successText === true) successText = lang('已成功完成', 'successful completed');
        $('.loading-mask>.loading-txt>div:first').html('<span class="svg-icon svg-check" style="color:white;font-size: 45px;"></span>');
        $('.loading-mask>.loading-txt>.txt').html(successText);
        setTimeout(function () { $('.loading-mask').remove(); }, 1500);
    }
    else {
        $('.loading-mask').remove();
    }
}

/** 打印当前页面 */
function openPrint(IsLandscape) {
    if (arguments.length > 0) _miss_fun._IsLandscape = !!IsLandscape;
    var selfFrame = window.frameElement;
    if (selfFrame && $(selfFrame).attr('isprintpreview') === '1') return;
    var w = screen.width - 80, h = screen.height - 160;
    var url = '/Common/Help/PrintPreview';
    window.open(url, '', 'left=40,top=40,width=' + w + ',height=' + h);
}

/**
 * 生成下载链接 可带多个参数 
 * 示例：openDownload(svr.BatchPrint, DocNo, lineNo);
 */
function openDownload(callback) {
    openLoading(lang("正在生成下载，请稍候", "Generating...Please wait..."));
    var argValues = [];
    for (var i = 1; i < arguments.length; i++) {
        argValues.push(arguments[i]);
    }
    argValues.push(function () {
        _miss_fun.iGridViewExportExcel();
    });

    callback.apply(svr, argValues);
}

/**
 * 播放声音
 * @param {string} src 声音src
 */
function playSound(src) {
    if (!src) {
        $('[objtype="audio"]').remove();  //pause()
        return;
    }
    setTimeout(function () {
        var objID = src.replace(/\/|\.|\\|\"|\'|\s|\:/g, '_');
        if (objID.length > 50) objID = objID.substr(objID.length - 50);
        objID = "objSound_" + objID;

        var $obj = $('#' + objID);
        if ($obj.length === 0) {
            if ($.browser.msie) {
                $('body').append('<embed objtype="audio" id="' + objID + '" src="' + src + '" loop="0" hidden="true"></embed>');
            }
            else {
                $('body').append('<audio objtype="audio" id="' + objID + '" src="' + src + '" style="display:none"></audio>');
            }
        }
        document.getElementById(objID).play();
    }, 0);
}

//----------------------------------------------------------------------

/**
 * 防抖函数
 * func：传入一个函数，事件不再持续触发时会调用该函数
 * delay:定义持续多久后执行传入的回调函数
 */
function debounce(func, delay) {
    let timer = null  // 用于保存定时器
    return function () {
        // 如果定时器存在，清除定时器，随后重新设置timer
        if (timer !== null) clearTimeout(timer)
        timer = setTimeout(func, delay)  // 超过delay为接收到事件会调用这里的func   必要的额时候可以修改func的this指向  由于timer对外部存在引用，因此不会被销毁
    }
}

/**
 * 多语言文本
 * @param {(string | number)} idOrCN 语言包ID或中文文本.
 * @param {string} enText 英文文本.
*/
function lang(idOrCN, enText) {
    var storageKey = "lang~" + idOrCN + "~" + (enText || '');
    var cnen = SessionStorageTryGet(storageKey, function () {
        var url = "/api/i18n/val?idOrCN=" + encodeURIComponent(idOrCN);
        if (enText) url += "&enText=" + encodeURIComponent(enText);
        return $.GetRemoteData(url);
    });
    cnen = cnen.split('|$#$|');
    if (cnen.length !== 2) return idOrCN;
    if (lang.isEn()) return cnen[1];
    return cnen[0];
}
lang.cn = function (id) {
    var storageKey = "langcn~" + id;
    return SessionStorageTryGet(storageKey, function () {
        return $.GetRemoteData("/api/i18n/cn?id=" + id);
    });
};
lang.en = function (idOrCN) {
    var storageKey = "langen~" + idOrCN;
    return SessionStorageTryGet(storageKey, function () {
        return $.GetRemoteData("/api/i18n/en?idOrCN=" + encodeURIComponent(idOrCN));
    });
};
lang.isEn = function () {
    var storageKey = "langisen";
    var ret = SessionStorageTryGet(storageKey, function () {
        return $.GetRemoteData("/api/i18n/isEn");
    });
    return ret === 'true';
};


/**-- 全局 $(document).on --------------*/
$(document).ready(function () {

    $(document).ajaxStart(function () {
        _miss_fun._hasAjaxRequest = true;
    });
    $(document).ajaxStop(function () {
        _miss_fun._hasAjaxRequest = false;
        setTimeout(function () {
            if (_miss_fun._hasAjaxRequest == false && ictr._rundata_.ajaxDoneCallback) {
                $.each(ictr._rundata_.ajaxDoneCallback, function () { this(); });
                ictr._rundata_.ajaxDoneCallback.length = 0;
            }
        }, 100);
    });

    //页面帮助-退出全屏
    $(document).on("keydown", _miss_fun._documentKeyDown);

    //页面关闭清除iGridView的session
    $(window).on('unload', function () {
        window._miss_unloaded = true;
        if (window._IsiGridViewKeepBuffer === true) return;

        if (window._iReferenceGridBuffer) {
            var GridKeys = window._iReferenceGridBuffer.join('|');
            var url = "/api/icontrols/iGridViewData/ClearSession?GridKeys=" + encodeURIComponent(GridKeys);
            if (navigator.sendBeacon)
                navigator.sendBeacon(url);
            else {
                $.ajax({
                    type: "POST",
                    async: false,
                    contentType: 'application/x-www-form-urlencoded',
                    url: url
                });
            }
        }

        var moduleKeys = [];
        $('div[ctrtype="iAttachment"]').each(function () {
            var $att = $(this);
            if ($att.attr('isdisabled') !== 'true' && $att.attr('allowupload') !== 'false' && !$att.attr('dockey') && $att.attr('modulekey')) {
                moduleKeys.push($att.attr('modulekey'));
            }
        });

        if (moduleKeys.length > 0) {
            var url1 = "/api/icontrols/iAttachmentData/ClearTempKeysAsync?ModuleKeyList=" + encodeURIComponent($.toJsonString(moduleKeys));
            if (navigator.sendBeacon)
                navigator.sendBeacon(url1);
            else {
                $.ajax({
                    type: "POST",
                    async: false,
                    contentType: 'application/x-www-form-urlencoded',
                    url: url1
                });
            }
        }
    });

    //设置iGridView的rowhead为checkbox时整个td点击，选中（不选中）复选框
    $(document).on({
        click: function (evt) {
            var $chkbox = $(this).find('input[type="checkbox"]');
            if ($chkbox.length === 1 && $chkbox.prop('disabled') === false && evt.target !== $chkbox[0]) {
                $chkbox.click();
            }
        }
    }, 'td[rowhead="checkbox"]');

    // 文本框
    $(document).on({
        keydown: function (event) {
            event = event || window.event;
            if (event.keyCode == 13) {
                var ctrType = $(this).parent().attr('ctrtype');
                if (ctrType === 'iReference') $(this).blur();
            }
        },
        focus: function () {
            var $this = $(this);
            var $wrap = $this.parent(".ictr-wrap").addClass("focus");
            var curval = $this.val();
            var texttype = $wrap.attr('texttype');
            if (texttype === 'integer' || texttype === 'decimal' || texttype === 'percent') {
                $this.val($this.val().replace(/ /g, '').replace(/,/g, ''));
            }
            var ctrType = $wrap.attr('ctrtype');
            if ((ctrType === 'iText' || ctrType === 'iSelect' && $wrap.attr('uservalue') === 'true') && $wrap.attr('_rawValue') === undefined) $wrap.attr('_rawValue', $this.val());
            if (ctrType === 'iReference' || ctrType === 'iSelect') {
                var showtype = $wrap.attr('showtype');
                $this.val(showtype == 'desc' ? $wrap.attr('desc') : (showtype == 'key' ? $wrap.attr('key') : $wrap.attr('code')));
            }
            if (curval !== '') {
                setTimeout(function () {
                    if (document.activeElement === $this[0] && !$.browser.isPhone) $this.select();
                }, 100);
            }
        },
        blur: function () {
            var $this = $(this);
            var $wrap = $this.parent(".ictr-wrap");
            setTimeout(function () {
                var $actEl = $(document.activeElement);
                if ($actEl[0] === $this[0] || $this.siblings('.righticon').length > 0 && $actEl[0] === $this.siblings('.righticon')[0]) return;
                var childpickerID = $this.attr('childpickerID');
                if (childpickerID) {
                    if (!_miss_fun.isActiveEle($actEl, childpickerID)) {
                        $this.removeAttr('childpickerID');
                        $($this[0].ownerDocument).find('#' + childpickerID).remove();
                        $this.siblings('.righticon').removeClass('fa-rotate-180');

                    } else {
                        return;
                    }
                }
                var ctrType = $wrap.attr('ctrtype');
                if ($wrap.attr('ctrtype') === 'iText') {
                    if ($wrap.attr('_rawValue') != $this.val()) _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                    $wrap.removeAttr('_rawValue');
                }
                else if (ctrType === 'iSelect' && $this[0].nodeName !== "SELECT") {
                    var txt = $this.val();
                    if ($wrap.attr('uservalue') === 'true' && $wrap.attr('_rawValue') !== txt) {
                        $wrap.attr('key', txt).attr('code', txt).attr('desc', txt);
                        $this.attr('title', txt);
                        _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                    }
                    else {
                        var showtype = $wrap.attr('showtype');
                        var key = $wrap.attr('key');
                        var code = $wrap.attr('code');
                        var desc = $wrap.attr('desc');
                        $this.val(showtype == 'desc' ? desc : (showtype == 'key' ? key : code));
                    }
                    $wrap.removeAttr('_rawValue');
                    if ($wrap.attr('id') == '_iTextDatetimePicker_Hour' || $wrap.attr('id') == '_iTextDatetimePicker_Minute') $wrap.blur(); //DateTimePicker里选择时分的控件
                }
                else if (ctrType === 'iReference' && !$wrap.iDisabled()) {
                    if ($wrap.parent().length === 0) return;
                    var inputVal = $this.val();
                    var showtype = $wrap.attr('showtype');
                    var key = $wrap.attr('key');
                    var code = $wrap.attr('code');
                    var desc = $wrap.attr('desc');

                    if (inputVal == code || inputVal == key || inputVal == desc)
                        $this.val(showtype == 'desc' ? desc : (showtype == 'key' ? key : code));
                    else
                        $wrap.iReferenceSetValue(inputVal, '#code#', true);
                }

                //integer decimal 格式化
                var texttype = $wrap.attr('texttype');
                if (texttype == 'integer' || texttype == 'decimal' || texttype == 'percent') {
                    var currentVal = $.trim($this.val()).replace(/\,/g, '');
                    if (currentVal && currentVal.substr(currentVal.length - 1) == "%") {
                        currentVal = $.optimizeNumber(parseFloat(currentVal.replace('%', '')) / 100);
                    }
                    else {
                        currentVal = $.optimizeNumber(parseFloat(currentVal));
                    }

                    if (currentVal !== 0 && !currentVal) currentVal = 0;

                    var fmtVal = $.FormatNumber(currentVal, $wrap.attr('FormatStr') || '-1');
                    $this.val(fmtVal);
                    $this.removeAttr('title');

                    fmtVal = $.trim(fmtVal).replace(/\,/g, '');
                    if (fmtVal && fmtVal.substr(fmtVal.length - 1) == "%") {
                        fmtVal = $.optimizeNumber(parseFloat(fmtVal.replace('%', '')) / 100);
                    }
                    else {
                        fmtVal = $.optimizeNumber(parseFloat(fmtVal));
                    }

                    if (fmtVal !== currentVal) _miss_fun.triggerAfterChange($wrap); //触发AfterChange事件
                }

                $wrap.removeClass("focus");
            }, 0);
        }
    }, ".ictr-input");

    $(document).on({
        mousedown: function () {
            var $wrap = $(this).parent();
            var ctrType = $wrap.attr('ctrtype');
            if (ctrType === 'iReference') {
                if ($wrap.iDisabled()) return;
                var s = $wrap.find('>input').val();
                if (s && (s == $wrap.attr('key') || s == $wrap.attr('code') || s == $wrap.attr('desc'))) s = '';
                $wrap.iReferenceOpenForm(s);
            }
        },
        focus: function () {
            if ($(this).parent(".ictr-wrap").hasClass('focus') === false) $(this).parent(".ictr-wrap").addClass("focus");
        },
        blur: function (evt) {
            $(this).siblings('.ictr-input').blur();
        }
    }, ".righticon");

    //integer / decimal input
    $(document).on({
        keypress: function (evt) {
            var $this = $(this);
            var texttype = $this.parent().attr('texttype');
            var Isdecimal = texttype === "decimal" || texttype === "percent";
            evt = evt || window.event;
            var evtkey = evt.keyCode ? evt.keyCode : evt.which;

            if (evtkey === 13) {
                try { this.blur(); } catch (e) { }
                evt.returnValue = false;
                return false;
            }
            if (!(evtkey >= 48 && evtkey <= 57 || evtkey >= 44 && evtkey <= 45 || Isdecimal && evtkey === 46)) {
                evt.returnValue = false;
                return false;
            }
        },

        blur: function () {
            var $ctr = $(this);
            var childpickerID = $ctr.attr('childpickerID');
            if (!childpickerID) return;
            setTimeout(function () {
                var $actEl = $(document.activeElement);
                if ($actEl[0] === $ctr[0] || $ctr.siblings('.righticon').length > 0 && $actEl[0] === $ctr.siblings('.righticon')[0]) return;
                if (!_miss_fun.isActiveEle($actEl, childpickerID)) {
                    $ctr.removeAttr('childpickerID');
                    $('#' + childpickerID).remove();
                }
            }, 0);
        }
    }, ".ictr-wrap[texttype=integer] .ictr-input, .ictr-wrap[texttype=decimal] .ictr-input, .ictr-wrap[texttype=percent] .ictr-input");
    $(document).on({
        click: function () {
            var $wrap = $(this).parent();
            var $ctr = $wrap.find('>input');
            var texttype = $wrap.attr('texttype');
            var IsDecimal = (texttype === "decimal" || texttype === "percent") ? true : (texttype === "integer" ? false : null);
            if (!IsDecimal === null) return;

            if ($wrap.attr('_rawValue') === undefined) $wrap.attr('_rawValue', $ctr.val());
            var childpickerID = $ctr.attr('childpickerID');
            if (childpickerID) {
                $ctr.removeAttr('childpickerID');
                $('#' + childpickerID).remove();
            }
            else {
                if ($wrap.iDisabled()) return;
                childpickerID = 'iCtrlChildPicker' + Math.random().toString().replace('.', '').replace('-', '');
                $ctr.attr('childpickerID', childpickerID).val($ctr.val().replace(/ /g, '').replace(/,/g, ''));
                var childpicker = newChildpickerHTML(childpickerID).css({ 'position': 'absolute', 'visibility': 'hidden' }).on('blur', function () { $ctr.blur(); });
                _miss_fun.showChildpicker($wrap, childpicker);
            }
            return false;

            function closeIt() {
                var childpickerID = $ctr.attr('childpickerID');
                if (childpickerID) {
                    $ctr.removeAttr('childpickerID');
                    $('#' + childpickerID).remove();
                }
            }

            function newChildpickerHTML(childpickerID) {
                var table = $('<table cellpadding="0" cellspacing="0" style="width:100%;"></table>');
                table.append('<tbody></tbody>');

                $("tbody", table).append('<tr><td>1</td><td>2</td><td>3</td><td class="fun" style="font-size:18px;">←</td></tr>');
                $("tbody", table).append('<tr><td>4</td><td>5</td><td>6</td><td class="fun">+1</td></tr>');
                $("tbody", table).append('<tr><td>7</td><td>8</td><td>9</td><td class="fun">-1</td></tr>');
                $("tbody", table).append('<tr><td>.</td><td>0</td><td>±</td><td class="fun" style="font-size:12px;">' + lang(15) + '</td></tr>');

                $('td', table).blur(function () { $(this).removeClass('focus'); $ctr.blur(); })
                    .mousedown(function () { $('td', table).removeClass('focus'); $(this).addClass('focus'); })
                    .mouseup(function () { $(this).removeClass('focus'); })
                    .hover(function () { $(this).addClass('hover'); }, function () { $(this).removeClass('hover'); })
                    .off('click').click(function () {
                        var val = $(this).text();
                        if (val === lang(15)) {
                            closeIt();
                            $ctr.focus();
                            return;
                        }
                        var currentVal = $ctr.val();
                        if (val === "+1") {
                            if (IsDecimal) {
                                currentVal = parseFloat(currentVal) || 0;
                            }
                            else {
                                currentVal = parseInt(currentVal) || 0;
                            }
                            currentVal++;
                            $ctr.val(currentVal.toString());
                        }
                        else if (val === "-1") {
                            if (IsDecimal) {
                                currentVal = parseFloat(currentVal) || 0;
                            }
                            else {
                                currentVal = parseInt(currentVal) || 0;
                            }
                            currentVal--;
                            $ctr.val(currentVal.toString());
                        }
                        else if (val === "←") {
                            if (currentVal.length > 0) $ctr.val(currentVal.substr(0, currentVal.length - 1));
                        }
                        else if (val === ".") {
                            if (currentVal.indexOf('.') < 0 && IsDecimal == true) {
                                $ctr.val(currentVal + val);
                            }
                        }
                        else if (val === "±") {
                            if (currentVal.indexOf('-') < 0) {
                                $ctr.val("-" + currentVal);
                            }
                            else {
                                $ctr.val(currentVal.replace('-', ''));
                            }
                        }
                        else {
                            $ctr.val(currentVal + val);
                        }
                    });

                return $('<div class="childpicker-wrap inumber shadow" id="' + childpickerID + '" style="width:160px;" pickertype="inumber" tabindex="99999")></div>').append(table);
            }

        }
    }, ".ictr-wrap[texttype=integer] .righticon, .ictr-wrap[texttype=decimal] .righticon, .ictr-wrap[texttype=percent] .righticon");

    //DatePicker
    $(document).on({
        click: function () {
            $(this).parent().find('>.ictr-input').click();
        }
    }, ".ictr-wrap[texttype=date] .righticon, .ictr-wrap[texttype=time] .righticon, .ictr-wrap[texttype=datetime] .righticon, .ictr-wrap[texttype=period] .righticon, .ictr-wrap[texttype=periodh] .righticon, .ictr-wrap[texttype=periodm] .righticon, .ictr-wrap[texttype=periodq] .righticon");

    $(document).on({
        click: function () {
            var $ctr = $(this);
            var $wrap = $ctr.parent();
            var childpickerID = $ctr.attr('childpickerID');
            if (childpickerID) {
                if ($wrap.attr('texttype') === "time") {
                    var choosentime = $('#' + childpickerID).attr('choosentime');
                    $ctr.val(choosentime);
                    $wrap.attr('_rawValue', choosentime);
                    _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件
                };
                $('#' + childpickerID).remove();
                $ctr.removeAttr('childpickerID');
            }
            else {
                if ($wrap.iDisabled()) return;
                var childpicker = _miss_fun.iTextDatePicker($ctr);
                _miss_fun.showChildpicker($wrap, childpicker);
                if ($wrap.attr('texttype') === "time" && document.body.scrollIntoViewIfNeeded) {
                    if ($('ul[ultype="hour"]>li.chosen', childpicker).length > 0) $('ul[ultype="hour"]>li.chosen', childpicker)[0].scrollIntoViewIfNeeded();
                    if ($('ul[ultype="minute"]>li.chosen', childpicker).length > 0) $('ul[ultype="minute"]>li.chosen', childpicker)[0].scrollIntoViewIfNeeded();
                }
            }
            return false;
        }
    }, ".ictr-wrap[texttype=date] .ictr-input, .ictr-wrap[texttype=time] .ictr-input, .ictr-wrap[texttype=datetime] .ictr-input, .ictr-wrap[texttype=period] .ictr-input, .ictr-wrap[texttype=periodh] .ictr-input, .ictr-wrap[texttype=periodm] .ictr-input, .ictr-wrap[texttype=periodq] .ictr-input");

    //search
    $(document).on({
        keypress: function (evt) {
            var $this = $(this);
            evt = evt || window.event;
            if ((evt.keyCode ? evt.keyCode : evt.which) == 13) {
                $this.parent().triggerHandler("search");
                evt.returnValue = false;
                return false;
            }
        }
    }, ".ictr-wrap[texttype=search] .ictr-input");
    $(document).on({
        click: function (evt) {
            $(this).parent().triggerHandler("search");
        }
    }, ".ictr-wrap[texttype=search] .righticon.xicon-search ");
    $(document).on({
        click: function (evt) {
            var $searchCtr = $(this).parent();
            if (_miss_fun.fnIsExist('iTextSearchMore')) {
                iTextSearchMore();
                return;
            }
            openDialog('/html/SearchCondition.html', function (ret) {
                if (!ret) return;
                if (ret == "#clearsearching#") ret = "";
                $searchCtr.find('>input.ictr-input').val(ret)
                $searchCtr.triggerHandler("search");
            });
        }
    }, ".ictr-wrap[texttype=search] .righticon.xicon-more");

    //--------------------------
    $(document).on({
        click: function (evt) {
            $(this).parent().triggerHandler("reference");
        }
    }, ".ictr-wrap[texttype=reference] .righticon");

    $(document).on({
        click: function (evt) {
            if (!('app' in window)) {
                openAlert('当前没有运行在App中');
                return;
            }
            var $ctr = $(this).parent();
            app.invoke("scanbarcode", function (ret) {
                if (!ret) return;
                $ctr.ival(ret)
            });
        }
    }, ".ictr-wrap[texttype=scan] .righticon");

    //iAttachment
    $(document).on({
        click: function (evt) {
            var $wrap = $(this).parent();
            if ($wrap.hasClass('ictr-input')) $wrap = $wrap.parent();
            if ($wrap.attr('isdisabled') === 'true' || $wrap.attr('allowupload') === "false") return;

            if ($(evt.target).hasClass('more') || $(evt.target).parent().hasClass('more') || $(evt.target).parent().parent().hasClass('more')) {
                openDialog('/html/PasteImg.html?ctrID=' + $wrap.attr('id'), function (ret) {
                    if (!ret) {
                        $wrap.iAttLoadList();
                        return;
                    }
                    _miss_fun.iAttFileSelected('paste', $wrap, ret);
                })
                return;
            }

            if ($wrap.find("input[type=file]").length === 0) {
                var FileExt = $wrap.attr('FileExt') || '';
                if (FileExt) FileExt = ' accept="' + FileExt + '"';
                var multiple = $wrap.attr('ismultiple') === 'true' ? ' multiple="multiple"' : '';
                var fileobj = '<div style="position:absolute; overflow:hidden; height:0px; width:0px; border:0px;"><input type="file"' + multiple + FileExt + ' onchange="_miss_fun.iAttFileSelected(\'selectfile\', this);" /></div>';
                $wrap.append(fileobj);
            }

            _miss_fun.iAttRunSelectFile($wrap);
        }
    }, ".ictr-wrap[ctrtype=iAttachment] .righticon, .ictr-wrap[ctrtype=iAttachment] .imgAdd");

    $(document).on({
        dragover: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        dragenter: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        drop: function (e) {
            e.preventDefault(); //必须要禁用浏览器默认事件
            e.stopPropagation();
            var $wrap = $(this);
            if ($wrap.attr('isdisabled') === 'true' || $wrap.attr('allowupload') === "false") return;
            var files = this.files;
            if (!files && e.dataTransfer) files = e.dataTransfer.files
            if (!files && e.originalEvent && e.originalEvent.dataTransfer) files = e.originalEvent.dataTransfer.files;

            if (files && files.length > 0) _miss_fun.iAttFileSelected('drag', $wrap, files);
        }
    }, ".ictr-wrap[ctrtype=iAttachment]");

    $(document).on({
        click: function () {
            var $wrap = $(this).parent().parent().parent();
            if ($wrap.attr('isdisabled') === 'true' || $wrap.attr('allowdelete') === "false") return;
            var fileID = $(this).parent().attr('FileID');
            openConfirm('确实要删除此文件吗？', function (ret) {
                if (ret) $wrap.iAttDelete(fileID);
            });
            return false;
        }
    }, ".ictr-wrap[ctrtype=iAttachment]>.ictr-input .deleteFile");

    $(document).on({
        click: function () {
            var $wrap = $(this).parent().parent().parent();
            if ($wrap.attr('isdisabled') === 'true' || $wrap.attr('allowdelete') === "false") return;
            var ItemName = $(this).parent().attr("filename");

            $wrap.iReferenceDeleteItem(ItemName);

            return false;
        }
    }, ".ictr-wrap[ctrtype=iReference]>.ictr-reference-itemlist .deleteFile");

    $(document).on({
        click: function () {
            var url = $(this).attr('url');
            openDialog('/Common/ShowAttFile?url=' + encodeURIComponent(url), 900, 860);
            return false;
        }
    }, ".ictr-wrap[ctrtype=iAttachment]>.ictr-input .showFile,.ictr-wrap[ctrtype=iReference]>.ictr-reference-itemlist .showFile");

    $(document).on({
        click: function () {
            $(this).openImg();
        }
    }, ".ictr-wrap[ctrtype=iAttachment]>.ictr-input .imgItem>img");

    //iSelect
    $(document).on({
        click: function () {
            $(this).parent().find('>.ictr-input').click();
        }
    }, ".ictr-wrap[ctrtype=iSelect]>.righticon");

    $(document).on({
        click: function () {
            var $ctr = $(this);
            var $wrap = $ctr.parent();

            var childpickerID = $ctr.attr('childpickerID');
            if (childpickerID) {
                $ctr.removeAttr('childpickerID');
                $('#' + childpickerID).remove();
                $ctr.siblings('.righticon').removeClass('fa-rotate-180');
            }
            else {
                if ($wrap.iDisabled()) return;
                $ctr.siblings('.righticon').addClass('fa-rotate-180');

                childpickerID = 'iCtrlChildPicker' + Math.random().toString().replace('.', '').replace('-', '');

                $ctr.attr('childpickerID', childpickerID);

                var $pickerTable = _miss_fun.BuildiSelectPickerTable($wrap);
                var childpicker = $('<div class="childpicker-wrap iselect shadow" id="' + childpickerID + '" style="min-width:' + $wrap.outerWidth() + 'px; max-height: 202px; overflow-x: hidden; overflow-y: auto;" pickertype="iselect" tabindex="99999")></div>').append($pickerTable);

                childpicker.css({ 'position': 'absolute', 'visibility': 'hidden' })
                    .on({
                        blur: function () { $ctr.blur(); },
                        keyup: function () { $ctr.keyup(); }
                    });

                childpicker.find('input').on('blur', function () { $ctr.blur(); });

                $("body").prepend(childpicker);
                //childpicker位置
                var windowHeight = Math.min(innerHeight, window.top.innerHeight);
                var windowWidth = window.innerWidth || document.body.clientWidth;
                var scrollTop = $(document).scrollTop();
                var pickerHeight = childpicker.outerHeight();
                var pickerWidth = childpicker.outerWidth();
                var poffset = $wrap.offset();
                var dpTop = $wrap.outerHeight() + poffset.top + 1;
                var dpLeft = poffset.left;

                if (dpTop + pickerHeight > windowHeight + scrollTop - 2) {
                    dpTop = poffset.top - pickerHeight - 3;
                    if (dpTop < scrollTop) {
                        dpTop = scrollTop;
                        var maxheight = windowHeight - scrollTop - dpTop - 2;
                        childpicker.css('max-height', maxheight + 'px');
                    }
                    else {
                        var maxheight = poffset.top - scrollTop - 2;
                        childpicker.css('max-height', maxheight + 'px');
                        dpTop = poffset.top - childpicker.outerHeight() - 1;
                    }
                }
                else {
                    if (dpTop < scrollTop) dpTop = scrollTop;
                    var maxheight = windowHeight - scrollTop - dpTop - 2;
                    childpicker.css('max-height', maxheight + 'px');
                }

                if (dpLeft + pickerWidth > windowWidth) {
                    dpLeft = windowWidth - pickerWidth - 4;
                }

                childpicker.offset({ top: dpTop, left: dpLeft }).css('visibility', 'visible');
            }
            return false;
        },
        keydown: function (event) {
            event = event || window.event;
            var $ctr = $(this);
            var $wrap = $ctr.parent();

            var childpickerID = $ctr.attr('childpickerID');
            if (!childpickerID && (keyCode !== 13 && keyCode !== 9)) $ctr.click();
            childpickerID = $ctr.attr('childpickerID');
            var childpicker = $('#' + childpickerID);

            var keyCode = event.keyCode;
            var currentindex = childpicker.find('table tr').index(childpicker.find('table tr.chosen'));
            var allcount = childpicker.find('table tr').length;
            if (keyCode == 38 || keyCode == 40 || keyCode == 36 || keyCode == 35) {
                if (keyCode == 38) //up
                {
                    currentindex--;
                    if (childpicker.find('table tr:eq(' + currentindex + ')>td[divider]').length > 0) currentindex--;
                    if (currentindex < 0) currentindex = 0;
                }
                else if (keyCode == 40) { //down
                    currentindex++;
                    if (childpicker.find('table tr:eq(' + currentindex + ')>td[divider]').length > 0) currentindex++;
                    if (currentindex > allcount - 1) currentindex = allcount - 1;
                }
                else if (keyCode == 36) { //home
                    currentindex = 0;
                }
                else if (keyCode == 35) { //end
                    currentindex = allcount - 1;
                }
                childpicker.find('table tr').removeClass('chosen');
                childpicker.find('table tr:eq(' + currentindex + ')').addClass('chosen');
                var scrolltop = (currentindex - 6) * 23;
                childpicker.scrollTop(scrolltop);
                return false;
            }
            else if (keyCode == 13 || keyCode == 9) { //回车、Tab
                if (currentindex === -1) currentindex = 0;
                var tr = childpicker.find('table tr:eq(' + currentindex + ')');
                if (tr.length > 0) {
                    tr.click();
                    return;
                }
                else if ($wrap.attr('uservalue') === 'true' && $ctr.val()) {
                    var el = $ctr.val();
                    $wrap.attr('key', el).attr('code', el).attr('desc', el);
                    $ctr.attr('title', el);
                    childpicker.remove();
                    $ctr.removeAttr('childpickerID').focus();
                    $ctr.siblings('.righticon').removeClass('fa-rotate-180');
                }
            }
            else {
                setTimeout(function () {
                    var pickerTable = _miss_fun.BuildiSelectPickerTable($wrap, $ctr.val());
                    childpicker.html(pickerTable);
                    childpicker.find('table tr').removeClass('chosen');
                    childpicker.find('table tr:eq(0)').addClass('chosen');
                }, 0);
            }
        }

    }, ".ictr-wrap[ctrtype=iSelect]>.ictr-input");

    //iLocation
    $(document).on({
        click: function (evt) {
            var $this = $(this).parent();
            openDialog('/html/GetLocation_Tianditu.html', 'choose', function (ret) {
                $this.ival(ret);
            })
        }
    }, '.ictr-wrap[ctrtype="iLocation"][isdisabled="false"]>.righticon');

    $('.ictr-wrap[ctrtype="iLocation"]').each(function () {
        var $this = $(this);
        setTimeout(function () {
            if ($this.attr('isdisabled') === "true" || $this.attr('isdisabled') === "disabled" || $this.attr('locaddr')) return;
            if (!app || !app.getLocation) {
                $this.ival("当前不是app环境");
                return;
            }
            app.getLocation(function (ret) {
                if (!ret || isError(ret)) return;
                $this.ival($.toJsonString(ret));
            });
        }, 300);
    });

    // 按纽
    $(document).on({
        mousedown: function () {
            $(this).focus();
            return false;
        },
        focus: function () {
            $(this).addClass("button-focus");
        },
        blur: function () {
            $(this).removeClass("button-focus");
        },
        click: function () {
            var $this = $(this);
            //防双击
            var t = $this.attr('_lastclicktime');
            if (t && Date.now() - t < 1000) return false;
            $this.attr('_lastclicktime', Date.now().toString());

            //按钮默认点击调用
            var id = $this.attr('id');
            var pasteData = ($this.attr('isPaste') == 'Paste') ? clipboardData.getData("Text") : null;
            if (_miss_fun.fnIsExist("iButtonClick")) iButtonClick(id, pasteData);
            if (id && _miss_fun.fnIsExist(id + '_click')) eval(id + '_click(pasteData);');
        }
    }, "button, input[type=button]");

    $(document).on({
        click: function () {
            //菜单默认点击调用
            var id = $(this).attr('id');
            if (_miss_fun.fnIsExist("iButtonClick")) iButtonClick(id);
            if (id && _miss_fun.fnIsExist(id + '_click')) eval(id + '_click();');
        }
    }, 'ul.dropdown-menu>li');

    // 粘贴 chrome / firefox /safari ...
    $(document).on({
        click: function () {
            var $this = $(this).select();
            setTimeout(function () {
                $this.focus().select()
            }, 10);
        },
        paste: function (e) {//paste事件 
            var $this = $(this);
            var id = $this.attr('id');
            var clipboardData = window.clipboardData || e.originalEvent.clipboardData
            var pasteData = clipboardData.getData('Text');
            if (pasteData) {
                if (_miss_fun.fnIsExist("iButtonClick")) iButtonClick(id, pasteData);
                if (id && _miss_fun.fnIsExist(id + '_click')) eval(id + '_click(pasteData);');
            }
        },
    }, ".btn-group-wrap>.iButtonPaste");

    //itips
    $(document).on({
        mouseenter: function () {
            var $this = $(this);
            var thisel = this;
            var tips = $this.attr('itips');
            if (tips) {
                $this.iTips(tips);
                $('body').on('mousemove', function (evt) {
                    var el = (evt || window.event).target;
                    if (thisel !== el && thisel !== el.parentElement && thisel !== el.parentElement.parentElement) {
                        $this.mouseleave();
                    }
                });
            }
        },
        mouseleave: function () {
            $(this).iTips(false);
            $('body').off('mousemove');
        }
    }, "[itips]");

    //iBarCode
    $(document).on({
        mouseenter: function () {
            var $this = $(this);
            var imgUrl = $this.attr('img');
            var desc = $this.attr('desc');
            var format = $this.attr('format') || '';
            var htm = '<div class="ibarcode shadow barcodeshow" format="' + format + '" style="position: absolute; z-index:999000;">';
            htm += '<img src="' + imgUrl + '" />';
            if (desc) htm += '<div class="ibarcode-desc">' + desc + '</div></div >';

            $(htm).zoomOpen({ $parent: $(window.top.document.body) });
        },
        mouseleave: function () {
            $(window.top.document.body).find('.ibarcode.barcodeshow').zoomClose();
        }
    }, "span[ctrtype='iBarCode']");

    $(document).on({
        click: function () {
            var $wrap = $(this);
            _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件
        }
    }, '[checkboxtype="single"]');

    $(document).on({
        click: function () {
            var $wrap = $(this).parent().parent();
            _miss_fun.triggerAfterChange($wrap, true); //触发AfterChange事件

            $wrap.find('>label>input').each(function () {
                var $input = $(this);
                if ($input.prop('checked')) {
                    $input.parent().addClass('checked');
                }
                else {
                    $input.parent().removeClass('checked');
                }
            })
        }
    }, '[checkboxtype="checkbox"]>label>input, [checkboxtype="radio"]>label>input');

    //iTabs
    $(document).on({
        click: function () {
            var $li = $(this);
            if ($li.attr('selected') != null) return;
            var $ul = $li.parent();
            var $wrap = $ul.parent().parent();
            var index = $ul.find('li').index($li);
            //event
            var tabText = $li.text();
            var isCancel = false;
            $.each(ictr._rundata_.itabsBeforeChange, function () { if (this($wrap, index, tabText) === false) isCancel = true; });
            if (isCancel) return;

            $wrap.iTabs(index);
        },
    }, ".itabs-wrap>.header>ul>li");

    //iSlideBar
    $(document).on({
        'mousedown touchstart': function () {
            var $block = $(this);
            var $wrap = $block.parent();
            var $leftbar = $wrap.find('.slidebar-left');
            var width = $wrap.width();
            var pleft = $wrap.offset().left;
            var min = $wrap.attr('min');
            var max = $wrap.attr('max');
            $("body").off("mousemove touchmove").on("mousemove touchmove", function (event) {
                event = event.changedTouches ? event.changedTouches[0] : event;
                event = event || window.event;
                var x = event.clientX - 5;
                slidebarMove($wrap, $block, $leftbar, width, pleft, min, max, x);
            }).off("mouseup touchend").on("mouseup touchend", function (event) {
                $("body").off('mousemove touchmove mouseup');
            });
        }
    }, '.slidebar>.slidebar-block');
    $(document).on({
        click: function (event) {
            event = event || window.event;
            var x = event.clientX - 5;
            var $this = $(this);
            var $wrap = $this.parent();
            var $block = $wrap.find('.slidebar-block');
            var $leftbar = $wrap.find('.slidebar-left');
            var width = $wrap.width();
            var pleft = $wrap.offset().left;
            var min = $wrap.attr('min');
            var max = $wrap.attr('max');
            slidebarMove($wrap, $block, $leftbar, width, pleft, min, max, x);
        }
    }, '.slidebar>.slidebar-line, .slidebar>.slidebar-left');
    function slidebarMove($wrap, $block, $leftbar, width, pleft, min, max, x) {
        if (x < pleft) x = pleft;
        if (x > pleft + width - 10) x = pleft + width - 10;
        var xx = ((x - pleft) / (width + 4) * 100) + "%";
        var xxleft = Math.floor((x - pleft) / (width - 10) * 100) + "%";
        if (xxleft == "0%") xxleft = "1px";
        var val;
        if (!min && !max)
            val = Math.floor((x - pleft) / (width - 10) * 100) + "%";
        else
            val = parseInt(min) + Math.floor((max - min) * (x - pleft) / (width - 10));
        $wrap.attr('val', val);
        $block.css('left', xx).attr('title', val);
        $leftbar.css('width', xxleft);
        _miss_fun.triggerAfterChange($wrap); //event

        var slidebarID = $wrap.attr('id');
        if (slidebarID && slidebarID.indexOf('islidebar_for_ireport_') === 0) {
            $wrap.parentUntil(function ($e) { return $e.attr('ctrtype') === 'iReport' }).iReportZoom(val);
        }
    }

    //PropertyGrid
    $(document).on({
        click: function () {
            var $img = $(this);
            if ($img.attr('src').indexOf('minus') > 0) {
                $img.attr('src', $img.attr('src').replace('minus', 'plus'));
                $img.parent().parent().nextAll().hide();
            } else {
                $img.attr('src', $img.attr('src').replace('plus', 'minus'));
                $img.parent().parent().nextAll().show();
            }
        }
    }, '.propertyGrid .rowhead>img');

    $(document).on({
        mouseover: function () { $(this).addClass('hover'); },
        mouseout: function () { $(this).removeClass('hover'); },
        click: function () {
            $(this).parent().parent().find('>tbody>tr').removeAttr('activated');
            $(this).attr('activated', 'true');
        }
    }, '.propertyGrid>.dbody>table>tbody>tr');

    $(document).on({
        mousemove: function (event) {
            event = event || window.event;
            var th = $(this);
            var index = th.parent().find('>th').index(th);
            var left = th.offset().left;
            if (th.prevAll().length == 0 && event.clientX - left < 4) return;
            if (index == 2 && event.clientX - left < 4 || index == 1 && (th.width() - (event.clientX - left)) < 4) th.css({ 'cursor': 'col-resize' });
            else th.css({ 'cursor': 'default' });
        },
        mousedown: function (event) {
            event = event || window.event;
            var th = $(this);
            var index = th.parent().find('>th').index(th);
            var pos = th.offset();
            var left = th.offset().left;
            var dbodyWidth = th.parentUntil(function (x) { return x.hasClass('propertyGrid'); }).width();
            if (th.prevAll().length == 0 && event.clientX - left < 4) return;
            if (index === 2 && event.clientX - left < 4 || index === 1 && (th.width() - (event.clientX - left)) < 4) {
                _PropertyGridlineMove = true;
                if (event.clientX - pos.left < th.width() / 2) _miss_fun._iGridViewcurrTh = th.prev();
                else _miss_fun._iGridViewcurrTh = th;
            }

            var $tbody = th.parent().parent().parent().parent().parent().find('.dbody>table');
            var $thead = th.parent().parent().parent();

            $("body").unbind("mousemove").bind("mousemove", function (event) {
                event = event || window.event;
                if (_PropertyGridlineMove == true) {
                    var pos = _miss_fun._iGridViewcurrTh.offset();
                    var newWidth = event.clientX - pos.left;
                    var ScrollBarWidth = $('.dbody').ScrollBarWidth('Y');
                    var newWidth1 = dbodyWidth - ScrollBarWidth - newWidth - 15;

                    if (newWidth > 0 && newWidth1 > 0) {
                        var columnnindex = _miss_fun._iGridViewcurrTh.parent().find('>th').index(_miss_fun._iGridViewcurrTh);
                        $thead.find('>colgroup>col:eq(' + columnnindex + ')').attr('width', newWidth);
                        $tbody.find('>colgroup>col:eq(' + columnnindex + ')').attr('width', newWidth);
                        columnnindex++;
                        $thead.find('>colgroup>col:eq(' + columnnindex + ')').attr('width', newWidth1);
                        $tbody.find('>colgroup>col:eq(' + columnnindex + ')').attr('width', newWidth1);
                    }
                    var tmpallwidth = 0; //计算表格实际宽度（解决IE 10.0 bug）
                    $tbody.find('>colgroup>col').each(function () { tmpallwidth += parseFloat($(this).attr('width')); });
                    $tbody.width(tmpallwidth);
                }
            }).unbind("mouseup").bind("mouseup", function (event) {
                $("body").unbind("mousemove").unbind("mouseup").unbind("selectstart");
                if (_PropertyGridlineMove == true) _PropertyGridlineMove = false;
            }).unbind("selectstart").bind("selectstart", function () { return !_PropertyGridlineMove; });
        }
    }, '.propertyGrid .dhead>table>thead>tr>th');

    $(document).on({
        click: function () {
            var $td = $(this);
            if ($td.find('>div').length > 0) return;
            var $wrap = $td.parent().parent().parent();
            if ($wrap.attr('isdisabled') == 'true') return;

            if (_miss_fun._iGridViewTDEdit_CurrentTD == $td[0]) {
                var $chkbox = $td.find('input[type="checkbox"]');
                if ($chkbox.length === 1 && $chkbox.prop('disabled') === false && evt.target !== $chkbox[0]) {
                    $chkbox.click();
                }
                return;
            }
            _miss_fun._iGridViewTDEdit_CurrentTD = $td[0];

            var ctrDiv;
            $.each(ictr._rundata_.igvInitEditCtrl, function () {
                var ret = this(null, $td, null, $wrap);
                if (ret && ret.CtrType) {
                    ctrDiv = ret;
                    return false;
                }
            });

            if (!ctrDiv) ctrDiv = new ictr.iText();

            var ctrDivID = ($td.attr('id') || $wrap.attr('id') || 'td') + 'iEditCtrl_1';
            ctrDiv.id = ctrDivID;

            _miss_fun.iGridViewTDEditEvent(ctrDiv, $td, null, $td.attr('ShowField'), $wrap, null);
        }
    }, 'td.tdedit');

    $(document).on({
        click: function () {
            var $obj = $(this);
            var w = $obj.attr('dlgwidth');
            var h = $obj.attr('dlgheight');
            var url = $obj.attr('dlgurl');
            if (url) {
                url = $.trim(url);
                var $url = $.trim((url + '   ').substr(0, 3));
                if ($url === '$p=' || $url === '#p=') {
                    url = '/Common/iControls/iLabel_DetailInfo?be=Miss.Org.Person&val=' + url.substr(3);
                }
                else if ($url === '$c=' || $url === '#c=') {
                    url = '/Common/iControls/iLabel_DetailInfo?be=Miss.BE.SD.Customer&val=' + url.substr(3);
                }
                if (url.substr(0, 1) === '>')
                    window.open(url.substr(1));
                if (url.substr(0, 1) === '+')
                    openNewTab(url.substr(1));
                else if (url.indexOf("(") > 0 && url.indexOf(")") > 0)
                    eval(url);
                else if (url.substr(0, 1) === '!')
                    openDialog(url.substr(1), 'full');
                else
                    openDialog(url, { width: w, height: h, max: true });
            }
        }
    }, '[dlgurl]:not([dlgurl=""])');

    $(document).on({
        click: function (e) {
            var $target = $(e.target);

            if ($target.parentUntil(function ($t) { return $t.hasClass('panel') }).length > 0) return;

            var $this = $(this);
            if ($this.parent().attr('istoggling')) return;
            $this.parent().attr('istoggling', 'true');

            var isPartner = $this.parent().attr('isPartner');

            if ($this.hasClass('expanded')) { //收缩
                $this.find('.panel').slideToggle(300, function () {
                    $this.removeClass('expanded');
                    $this.parent().removeAttr('istoggling');
                    if (isPartner) $this.find('.panel>.iGridViewPartner-container').empty();
                });
            }
            else { //展开
                var $exp = $this.parent().find('>.expanded');
                if ($exp.length > 0) {
                    $exp.find('.panel').slideToggle(260, function () {
                        $exp.removeClass('expanded');
                        if (isPartner) $exp.find('.panel>.iGridViewPartner-container').empty();
                    });
                }
                if (isPartner) {
                    var rowIdx = $this.attr('igvrowidx');
                    var $igvPartner = $this.parent().parent().parent().iGridViewActiveRow(rowIdx);
                    var partnerID = $this.find('.panel').attr('id');
                    if (!partnerID) {
                        partnerID = 'igvPartner_' + Math.random().toString().substr(2);
                        $this.find('.panel').attr('id', partnerID);
                    }
                    _miss_fun.iGridViewBuildPartner($igvPartner, partnerID);
                }
                $this.find('.panel').slideToggle(300, function () {
                    $this.addClass('expanded');
                    $this.parent().removeAttr('istoggling');
                });
            }
        }
    }, '.iDetail-ul.expd>li, .iDetail-ul>li.expd');

    $(document).on('click', '.iGridViewPartner-buttons>span.xiconfont', function () {

        var $this = $(this);
        var $partner = $this.parent().parent();
        var igvID = $partner.attr('igvID');
        if (!igvID) return;

        var $igv = $('#' + igvID);
        var currentrow = parseInt($this.parent().find('div[id$=currentrow]').text());

        if ($this.hasClass('xicon-menuup')) {
            if (currentrow === 1) return;
            currentrow = (currentrow - 1) || 1;
            $igv.iGridViewActiveRow(currentrow - 1)
        }
        else {
            $igv.iGridViewActiveRow(currentrow)
        }
    });

    //iGridView/iReport Button
    $(document).on({
        click: function () {
            var $btn = $(this);
            var $this = $btn.parent().parent();

            if ($this.hasClass('iGridView')) {
                //缩放
                if ($btn.hasClass('Zoom')) { $this.iFullform(); return; }
                //搜索
                if ($btn.hasClass('Search')) {
                    $this.iGridViewSearch();
                    return;
                }
                //打开查询方案
                if ($btn.hasClass('Query')) { $this.iGridViewShowStrategy(); return; }
                //导出到Excel
                if ($btn.hasClass('Export')) { $this.iGridView('exportXLS'); return; }
                //刷新
                if ($btn.hasClass('Refresh')) { $this.iGridView(); return; }
                //从Excel导入数据
                if ($btn.hasClass('Import')) { $this.iGridViewImportExcel(); return; }
                //显示上次查询结果
                if ($btn.hasClass('History')) { $this.iGridViewHistory(); return; }
                //追加行
                if ($btn.hasClass('AddRow')) { $this.iGridViewAddRow(); return; }
                //插入行
                if ($btn.hasClass('InsertRow')) { $this.iGridViewInsertRow(); return; }
                //删除行
                if ($btn.hasClass('DeleteRow')) { $this.iGridViewDeleteRow(); return; }
                //批量导入/修改
                if ($btn.hasClass('BatchEdit')) { $this.iGridViewBatchEdit(1); return; }
                //批量导入/修改
                if ($btn.hasClass('BatchImport')) { $this.iGridViewBatchEdit(0); return; }
            }
            else {
                //iReport 导出到Excel
                if ($btn.hasClass('Export')) { $this.iReport('exportXLS'); return; }
                //iReport 刷新
                if ($btn.hasClass('Refresh')) { $this.iReport(); return; }
            }
        }
    }, '[ctrtype=iGridView]>.dpager>.iGridViewButton, [ctrtype=iReport]>.dpager>.iGridViewButton');

    //grail - split move
    var _$grailSlider;
    var _$grailColumn;
    var _$grailParent;
    var _grailWidth = 0;
    var _grailOffsetX = 0;
    var _grailHeight = 0;
    var _grailOffsetY = 0;
    var _grailMovingType;
    var _grailMargin = 0;
    var _grailScrollTop = 0;
    var _grailScrollLeft = 0;

    $(document).on({
        mousedown: function () {
            _$grailSlider = $(this);
            _$grailParent = _$grailSlider.parent();

            _grailOffsetX = _$grailParent.offset().left;
            _grailOffsetY = _$grailParent.offset().top;

            _grailScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            _grailScrollLeft = document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;

            var grailmask = "<div class='grailmask' style='position:absolute; top:0px; bottom:0px; left:0px; right:0px;z-index:10;'></div>";
            var dvContext = _$grailParent.find('>div[grail-content]');
            dvContext.append(grailmask);

            if (_$grailSlider.hasClass('grail-slider-left')) {
                _grailMovingType = 'left';
                _$grailColumn = _$grailParent.find('>div[grail-left]');
                _grailMargin = dvContext.outerWidth() + dvContext.offset().left;
            }
            else if (_$grailSlider.hasClass('grail-slider-right')) {
                _grailMovingType = 'right';
                _$grailColumn = _$grailParent.find('>div[grail-right]');
                _grailMargin = dvContext.offset().left;
                _grailWidth = _$grailColumn.offset().left + _$grailColumn.outerWidth();
            }
            else if (_$grailSlider.hasClass('grail-slider-top')) {
                _grailMovingType = 'top';
                _$grailColumn = _$grailParent.find('>div[grail-top]');
                _grailMargin = dvContext.outerHeight() + dvContext.offset().top;
            }
            else if (_$grailSlider.hasClass('grail-slider-bottom')) {
                _grailMovingType = 'bottom';
                _$grailColumn = _$grailParent.find('>div[grail-bottom]');
                _grailMargin = dvContext.offset().top;
                _grailHeight = _$grailColumn.offset().top + _$grailColumn.outerHeight();
            }
            _$grailColumn.append(grailmask);

            //_$grailParent.find('>div:not(.grail-slider-left,.grail-slider-right,.grail-slider-top,.grail-slider-bottom)');//.addClass('content-cloak');
            _$grailSlider.css('background-color', '#eee');

            $(document).on({
                mouseup: function () {
                    //_$grailParent.find('>div');//.removeClass('content-cloak');
                    _$grailParent.find('.grailmask').remove();
                    _$grailSlider.css('background-color', 'transparent');
                    _$grailParent.iCtrSetHeight();
                    $(document).off('mousemove');
                    $(document).off('mouseup');
                    $(window).resize();
                },
                mousemove: function (evt) {
                    evt = window.event || evt;
                    if (_grailMovingType === 'left') {
                        var x = evt.clientX + _grailScrollLeft - _grailOffsetX + 3;
                        if (x < 10) x = 10;
                        if (x > _grailMargin - _grailOffsetX) x = _grailMargin - _grailOffsetX;
                        _$grailParent.css('padding-left', x + 'px');
                        _$grailColumn.css({ 'margin-left': (-x + 2) + 'px', 'width': (x - 8) + 'px' });
                    }
                    else if (_grailMovingType === 'right') {
                        var x = _grailWidth - evt.clientX - _grailScrollLeft + 4;
                        if (x < 10) x = 10;
                        if (x > _grailWidth - _grailMargin) x = _grailWidth - _grailMargin;
                        _$grailParent.css('padding-right', x + 'px');
                        _$grailColumn.css({ 'margin-right': (-x + 2) + 'px', 'width': (x - 8) + 'px' });
                    }
                    else if (_grailMovingType === 'top') {
                        var y = evt.clientY + _grailScrollTop - _grailOffsetY + 3;
                        if (y < 10) y = 10;
                        if (y > _grailMargin - _grailOffsetY) y = _grailMargin - _grailOffsetY;
                        _$grailParent.css('padding-top', y + 'px');
                        _$grailColumn.css({ 'margin-top': (-y + 2) + 'px', 'height': (y - 8) + 'px' });

                    }
                    else if (_grailMovingType === 'bottom') {
                        var y = _grailHeight - evt.clientY - _grailScrollTop + 5;
                        if (y < 10) y = 10;
                        if (y > _grailHeight - _grailMargin) y = _grailHeight - _grailMargin;

                        _$grailParent.css('padding-bottom', y + 'px');
                        _$grailColumn.css({ 'margin-bottom': (-y + 2) + 'px', 'height': (y - 8) + 'px' });
                    }
                }
            });
        }
    }, 'div.grail-slider-left, div.grail-slider-right, div.grail-slider-top, div.grail-slider-bottom');


    setTimeout(function () {

        if ($.browser.isApp) {
            //重写window.open
            //window.open = function (url) { openDialog(url); };

            $(document).on('click', 'a', function () {
                var $this = $(this);
                if ($this.attr('_download')) return;
                var href = $this.attr('href');
                if (!href) return;

                var lhref = href.toLocaleLowerCase();
                if (lhref.endsWith('.pdf') && href.indexOf('showpdf.html') < 0) {
                    href = href.replace("/attfiles/A", "/attfiles/I");
                    openDialog("/html/ShowPdf.html?" + encodeURIComponent(href));
                    return false;
                }
                if (lhref.endsWith('.jpg') || lhref.endsWith('.jpeg') || lhref.endsWith('.png')) {
                    href = href.replace("/attfiles/A", "/attfiles/I");
                    openDialog("/html/ShowImg.html?" + encodeURIComponent(href));
                    return false;
                }

                var target = $this.attr('target');
                if (!target || $.trim(target).toLowerCase() != "_blank") return;
                openDialog(href);
                return false;
            });
        }

        //iItemTitleHeight
        _miss_fun.AutoSizeE9iframe();
        _miss_fun.SetiItemTitleHeight();
        $(window).resize(function () {
            _miss_fun.AutoSizeE9iframe();
            _miss_fun.SetiItemTitleHeight();
        });
    }, 0);

    setTimeout(function () {
        _miss_fun.iCodeRefresh();
    }, 1200);

    //autosize-bottom
    $('div[autosize-bottom]').each(function () {
        var $this = $(this);
        $this.ResizeContainer(function () { $this.AutosizeBottom(); });
    });
});

/**-- Touch ---------------------------*/
/*https://github.com/madrobby/zepto/blob/main/src/touch.js#files
swipe      滑动事件
swipeLeft  ←左滑事件
swipeRight →右滑事件
swipeUp    ↑上滑事件
swipeDown  ↓下滑事件
doubleTap  双击事件
tap        点击事件(非原生click事件)
singleTap  单击事件
longTap    长按事件
--------------------------
TouchZoom
 */

(function ($) {
    var touch = {},
        touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
        longTapDelay = 750,
        gesture,
        down, up, move,
        eventMap,
        initialized = false

    function swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >=
            Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
    }

    function longTap() {
        longTapTimeout = null
        if (touch.last) {
            touch.el.trigger('longTap')
            touch = {}
        }
    }

    function cancelLongTap() {
        if (longTapTimeout) clearTimeout(longTapTimeout)
        longTapTimeout = null
    }

    function cancelAll() {
        if (touchTimeout) clearTimeout(touchTimeout)
        if (tapTimeout) clearTimeout(tapTimeout)
        if (swipeTimeout) clearTimeout(swipeTimeout)
        if (longTapTimeout) clearTimeout(longTapTimeout)
        touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
        touch = {}
    }

    function isPrimaryTouch(event) {
        return (event.pointerType == 'touch' ||
            event.pointerType == event.MSPOINTER_TYPE_TOUCH)
            && event.isPrimary
    }

    function isPointerEventType(e, type) {
        return (e.type == 'pointer' + type ||
            e.type.toLowerCase() == 'mspointer' + type)
    }

    // helper function for tests, so they check for different APIs
    function unregisterTouchEvents() {
        if (!initialized) return
        $(document).off(eventMap.down, down)
            .off(eventMap.up, up)
            .off(eventMap.move, move)
            .off(eventMap.cancel, cancelAll)
        $(window).off('scroll', cancelAll)
        cancelAll()
        initialized = false
    }

    function setup(__eventMap) {
        var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

        unregisterTouchEvents()

        eventMap = (__eventMap && ('down' in __eventMap)) ? __eventMap :
            ('ontouchstart' in document ?
                {
                    'down': 'touchstart', 'up': 'touchend',
                    'move': 'touchmove', 'cancel': 'touchcancel'
                } :
                'onpointerdown' in document ?
                    {
                        'down': 'pointerdown', 'up': 'pointerup',
                        'move': 'pointermove', 'cancel': 'pointercancel'
                    } :
                    'onmspointerdown' in document ?
                        {
                            'down': 'MSPointerDown', 'up': 'MSPointerUp',
                            'move': 'MSPointerMove', 'cancel': 'MSPointerCancel'
                        } : false)

        // No API availables for touch events
        if (!eventMap) return

        if ('MSGesture' in window) {
            gesture = new MSGesture()
            gesture.target = document.body

            $(document)
                .bind('MSGestureEnd', function (e) {
                    var swipeDirectionFromVelocity =
                        e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null
                    if (swipeDirectionFromVelocity) {
                        touch.el.trigger('swipe')
                        touch.el.trigger('swipe' + swipeDirectionFromVelocity)
                    }
                })
        }

        down = function (e) {
            if ((_isPointerType = isPointerEventType(e, 'down')) &&
                !isPrimaryTouch(e)) return
            firstTouch = _isPointerType ? e : e.touches[0]
            if (e.touches && e.touches.length === 1 && touch.x2) {
                // Clear out touch movement data if we have it sticking around
                // This can occur if touchcancel doesn't fire due to preventDefault, etc.
                touch.x2 = undefined
                touch.y2 = undefined
            }
            now = Date.now()
            delta = now - (touch.last || now)
            touch.el = $('tagName' in firstTouch.target ?
                firstTouch.target : firstTouch.target.parentNode)
            touchTimeout && clearTimeout(touchTimeout)
            touch.x1 = firstTouch.pageX
            touch.y1 = firstTouch.pageY
            if (delta > 0 && delta <= 250) touch.isDoubleTap = true
            touch.last = now
            longTapTimeout = setTimeout(longTap, longTapDelay)
            // adds the current touch contact for IE gesture recognition
            if (gesture && _isPointerType) gesture.addPointer(e.pointerId)
        }

        move = function (e) {
            if ((_isPointerType = isPointerEventType(e, 'move')) &&
                !isPrimaryTouch(e)) return
            firstTouch = _isPointerType ? e : e.touches[0]
            cancelLongTap()
            touch.x2 = firstTouch.pageX
            touch.y2 = firstTouch.pageY

            deltaX += Math.abs(touch.x1 - touch.x2)
            deltaY += Math.abs(touch.y1 - touch.y2)
        }

        up = function (e) {
            if ((_isPointerType = isPointerEventType(e, 'up')) &&
                !isPrimaryTouch(e)) return
            cancelLongTap()

            // swipe
            if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

                swipeTimeout = setTimeout(function () {
                    if (touch.el) {
                        touch.el.trigger('swipe')
                        touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
                    }
                    touch = {}
                }, 0)

            // normal tap
            else if ('last' in touch)
                // don't fire tap when delta position changed by more than 30 pixels,
                // for instance when moving to a point and back to origin
                if (deltaX < 30 && deltaY < 30) {
                    // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
                    // ('tap' fires before 'scroll')
                    tapTimeout = setTimeout(function () {

                        // trigger universal 'tap' with the option to cancelTouch()
                        // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
                        var event = $.Event('tap')
                        event.cancelTouch = cancelAll
                        // [by paper] fix -> "TypeError: 'undefined' is not an object (evaluating 'touch.el.trigger'), when double tap
                        if (touch.el) touch.el.trigger(event)

                        // trigger double tap immediately
                        if (touch.isDoubleTap) {
                            if (touch.el) touch.el.trigger('doubleTap')
                            touch = {}
                        }

                        // trigger single tap after 250ms of inactivity
                        else {
                            touchTimeout = setTimeout(function () {
                                touchTimeout = null
                                if (touch.el) touch.el.trigger('singleTap')
                                touch = {}
                            }, 250)
                        }
                    }, 0)
                } else {
                    touch = {}
                }
            deltaX = deltaY = 0
        }

        $(document).on(eventMap.up, up)
            .on(eventMap.down, down)
            .on(eventMap.move, move)

        // when the browser window loses focus,
        // for example when a modal dialog is shown,
        // cancel all ongoing events
        $(document).on(eventMap.cancel, cancelAll)

        // scrolling the window indicates intention of the user
        // to scroll, not tap or swipe, so cancel all ongoing events
        $(window).on('scroll', cancelAll)

        initialized = true
    }

    ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
        'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function (eventName) {
            $.fn[eventName] = function (callback) { return this.on(eventName, callback) }
        })

    $.touch = { setup: setup };

    $(document).ready(setup);

    $.fn.TouchZoom = function (progress) {
        var $this = $(this);
        if (!$.browser.isPhone) return $this;
        if ($this.attr('_hasBind_touchoZoom')) return $this;
        $this.attr('_hasBind_touchoZoom', 'true');

        var complete = null;
        var start = null;
        if (progress && progress.constructor !== Function) {
            complete = progress['complete'];
            start = progress['start'];
            progress = progress["progress"];
        }

        var startDistance, scale;
        var istouch = false;
        $(document).on('touchstart touchmove touchend', $this, function (event) {
            //手指移开屏幕
            if (event.type == 'touchend') {
                istouch = false;
                complete && complete(scale);
                return;
            }
            if (event.originalEvent.touches.length < 2) return;   // 屏幕上手指数量

            var touch1 = event.originalEvent.touches[0]; //targetTouches[0];  // 第一根手指touch事件
            var touch2 = event.originalEvent.touches[1]; //targetTouches[1];  // 第二根手指touch事件

            //手指放到屏幕上的时候，还没有进行其他操作
            if (event.type == 'touchstart') {
                // 缩放图片的时候X坐标起始值
                var startX = Math.abs(touch1.pageX - touch2.pageX);
                var startY = Math.abs(touch1.pageY - touch2.pageY);
                startDistance = Math.sqrt((startX * startX) + (startY * startY));
                istouch = true;
                start && start(scale);
            }
            //手指在屏幕上滑动
            else if (event.type == 'touchmove') {
                if (!istouch) return;
                // 缩放图片的时候X坐标滑动变化值
                var endX = Math.abs(touch1.pageX - touch2.pageX);
                var endY = Math.abs(touch1.pageY - touch2.pageY);
                var endDistance = Math.sqrt((endX * endX) + (endY * endY));
                scale = (endDistance - startDistance) * 2.5 / innerHeight + 1;
                progress && progress(scale);
            }
        });
    }

})(window.jQuery);

window.onerror = function (msg, url, line, col, err) {
    if (!msg || msg.indexOf('Uncaught ') === 0) return false;
    if (msg.indexOf('from accessing a cross-origin frame') > 0
        || msg.indexOf('getBoundingClientRect') > 0
        || msg.indexOf('Script error') == 0
        || msg.indexOf('拒绝访问') == 0
        || msg.indexOf('Access is denied') == 0
        || msg.indexOf('k.event.special[o.origType]') > 0
        || msg.indexOf('setDialogMoveableIE') > 0) {
        console.error(arguments);
        return false;
    }

    var errKey = msg + '|' + (url.indexOf('?') > 0 ? url.substr(0, url.indexOf('?')) : url) + '|' + line;

    if (_miss_fun._LastJsError == errKey) {
        console.error(arguments);
        return false; //true表示需要弹出错误提示。false不需要。
    }
    _miss_fun._LastJsError = errKey;

    var errData = {
        msg: msg,
        url: url,
        line: line
    };

    if (col) errData["col"] = col;
    if (err && err.stack) errData["stack"] = err.stack;
    errData.browser = $.browser.getBrowser();
    errData.useragent = navigator.userAgent;
    errData.href = location.href;
    try {
        $.ajax({
            type: "POST",
            contentType: 'application/x-www-form-urlencoded',
            url: "/api/utility/PostJsError",
            data: { errData: $.toJsonString(errData) },
            success: function () { }
        });
    }
    catch (e) { }
    console.error(arguments);
    return false; //true表示需要弹出错误提示。false不需要。
};
