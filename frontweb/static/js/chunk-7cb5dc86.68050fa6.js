(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-7cb5dc86"],{"1af6":function(e,t,n){var a=n("63b6");a(a.S,"Array",{isArray:n("9003")})},3953:function(e,t,n){"use strict";n.d(t,"a",(function(){return s}));var a=n("774e"),r=n.n(a),i=n("c8bb"),o=n.n(i);function s(e){if(o()(Object(e))||"[object Arguments]"===Object.prototype.toString.call(e))return r()(e)}},"549b":function(e,t,n){"use strict";var a=n("d864"),r=n("63b6"),i=n("241e"),o=n("b0dc"),s=n("3702"),c=n("b447"),l=n("20fd"),u=n("7cd6");r(r.S+r.F*!n("4ee1")((function(e){Array.from(e)})),"Array",{from:function(e){var t,n,r,d,f=i(e),v="function"==typeof this?this:Array,p=arguments.length,b=p>1?arguments[1]:void 0,m=void 0!==b,h=0,g=u(f);if(m&&(b=a(b,p>2?arguments[2]:void 0,2)),void 0==g||v==Array&&s(g))for(t=c(f.length),n=new v(t);t>h;h++)l(n,h,m?b(f[h],h):f[h]);else for(d=g.call(f),n=new v;!(r=d.next()).done;h++)l(n,h,m?o(d,b,[r.value,h],!0):r.value);return n.length=h,n}})},"54a1":function(e,t,n){n("6c1c"),n("1654"),e.exports=n("95d5")},"5a7c":function(e,t,n){"use strict";var a=n("77be"),r=n.n(a);r.a},"724f":function(e,t,n){"use strict";n.r(t);var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"add-interface-container"},[n("EnvDetail",{directives:[{name:"loading",rawName:"v-loading",value:e.isLoading,expression:"isLoading"}],attrs:{"env-data":e.envData,"project-id":e.projectId}}),e._v(" "),n("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[n("div",{staticClass:"app-btn app-btn-blue",attrs:{type:"primary"},on:{click:e.handleConfirm}},[e._v("保 存")]),e._v(" "),n("div",{staticClass:"app-btn app-btn-white",on:{click:e.handleCancel}},[e._v("返 回")])])],1)},r=[],i=(n("7f7f"),n("db72")),o=(n("5df3"),n("75fc")),s=(n("ac6a"),n("24d2")),c=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}],staticClass:"env-detail-main"},e._l(e.envData,(function(t){return n("div",{key:t.name,staticClass:"env-detail-main-content"},[n("h3",{staticClass:"title"},[e._v(e._s(t.name)+"\n      "),n("span",{staticClass:"app-link-blue add",on:{click:function(e){return t.envs.push({})}}},[e._v("添加")])]),e._v(" "),n("el-table",{staticStyle:{width:"100%"},attrs:{data:t.envs,"row-class-name":e.tableRowClassName}},[n("el-table-column",{attrs:{label:"名称","header-align":"center",align:"center"},scopedSlots:e._u([{key:"default",fn:function(t){return[n("el-input",{attrs:{size:"mini"},model:{value:t.row.name,callback:function(n){e.$set(t.row,"name",n)},expression:"scope.row.name"}})]}}],null,!0)}),e._v(" "),n("el-table-column",{attrs:{label:"环境描述","header-align":"center",align:"center"},scopedSlots:e._u([{key:"default",fn:function(t){return[n("el-input",{attrs:{size:"mini"},model:{value:t.row.desc,callback:function(n){e.$set(t.row,"desc",n)},expression:"scope.row.desc"}})]}}],null,!0)}),e._v(" "),n("el-table-column",{attrs:{label:"自定义变量","header-align":"center",align:"center"},scopedSlots:e._u([{key:"default",fn:function(t){return[n("el-input",{attrs:{size:"mini"},model:{value:t.row.variable,callback:function(n){e.$set(t.row,"variable",n)},expression:"scope.row.variable"}})]}}],null,!0)}),e._v(" "),n("el-table-column",{attrs:{label:"操作","header-align":"center",align:"center",width:"100px"},scopedSlots:e._u([{key:"default",fn:function(a){return[n("span",{staticClass:"app-link-blue",on:{click:function(n){a.row.id?e.deleteEnv(a.row,a.$index,t.envs):t.envs.splice(a.$index,1)}}},[e._v("删除")])]}}],null,!0)})],1)],1)})),0)},l=[],u={props:{envData:{type:Array,default:function(){return[]}}},data:function(){return{loading:!1}},methods:{tableRowClassName:function(e){var t=e.rowIndex;if(t%2===0)return"stripe-row"},deleteEnv:function(e,t,n){var a=this;this.$confirm("确认删除？").then((function(r){a.loading=!0,Object(s["e"])({id:e.id}).then((function(e){n.splice(t,1),a.$message({message:"删除成功",type:"success"})})).catch((function(e){a.$message({message:e.message,type:"error"})})).finally((function(e){a.loading=!1}))})).catch((function(e){}))}}},d=u,f=(n("5a7c"),n("2877")),v=Object(f["a"])(d,c,l,!1,null,"fd96727a",null),p=v.exports,b={components:{EnvDetail:p},data:function(){return{activeTabName:"tab-template",env:{servers:[],databases:[]},isDefault:!1,isLoading:!1,envData:[{name:"模板",envs:[]}]}},computed:{projectId:function(){return this.$route.params.id},allEnvs:function(){var e=[];return this.envData.forEach((function(t){return e.push.apply(e,Object(o["a"])(t.envs))})),e},allExistedEnvs:function(){return this.allEnvs.filter((function(e){return e.id}))}},created:function(){var e=this;Object(s["h"])({id:this.projectId}).then((function(t){e.envData=[{name:"模板",envs:t.data}]}))},methods:{handleCancel:function(){this.$router.go(-1)},handleConfirm:function(){var e=this;this.isLoading=!0,this.submitForm().then((function(t){e.$message({type:"success",message:"保存成功"}),e.$router.go(-1)})).catch((function(t){e.$message({type:"error",message:t.message})})).finally((function(t){e.isLoading=!1}))},submitForm:function(){return Promise.all([this.addRow(),this.updateRow()])},addRow:function(){var e=this,t=[];return this.envData.forEach((function(n){t.push.apply(t,Object(o["a"])(n.envs.filter((function(e){return!e.id})).map((function(t){return Object(i["a"])({},t,{project:e.projectId})}))))})),t.length?Object(s["c"])(t):Promise.resolve()},updateRow:function(){var e=this;return Promise.all(this.allExistedEnvs.map((function(t){return e.saveEnvRow(t)})))},saveEnvRow:function(e){var t=e.name,n=e.desc,a=e.variable;Object(s["l"])({id:e.id},{project:this.projectId,name:t,desc:n,variable:a})}}},m=b,h=(n("9912"),Object(f["a"])(m,a,r,!1,null,"4fba5ade",null));t["default"]=h.exports},"75fc":function(e,t,n){"use strict";var a=n("a745"),r=n.n(a);function i(e){if(r()(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}var o=n("3953");function s(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function c(e){return i(e)||Object(o["a"])(e)||s()}n.d(t,"a",(function(){return c}))},"774e":function(e,t,n){e.exports=n("d2d5")},"77be":function(e,t,n){},"95d5":function(e,t,n){var a=n("40c3"),r=n("5168")("iterator"),i=n("481b");e.exports=n("584a").isIterable=function(e){var t=Object(e);return void 0!==t[r]||"@@iterator"in t||i.hasOwnProperty(a(t))}},9912:function(e,t,n){"use strict";var a=n("be09"),r=n.n(a);r.a},a745:function(e,t,n){e.exports=n("f410")},be09:function(e,t,n){},c8bb:function(e,t,n){e.exports=n("54a1")},d2d5:function(e,t,n){n("1654"),n("549b"),e.exports=n("584a").Array.from},f410:function(e,t,n){n("1af6"),e.exports=n("584a").Array.isArray}}]);