define([
    // basics
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/keys',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./Legend/templates/Legend.html',
    'tools/xstyle/css!./Legend/css/Legend.css',
    'dojo/i18n!./Legend/nls/resource'
], function (declare, lang, array, domConstruct,
             on, keys,
             _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
             template, css, i18n) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'LegendWidget',
        i18n: i18n,

        postCreate: function () {
            this.inherited(arguments);
        }


    });
});
