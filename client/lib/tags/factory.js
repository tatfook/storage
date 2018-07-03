import _ from 'lodash';

import {tagFactory} from "./tag.js";

// 定义容器tag
export const divTag = function() {
	var tag = tagFactory("div");
	tag.name = "容器";
	tag.isContainer = true;

	return tag;
}

// 行容器
export const rowDivTag = function() {
	var tag = divTag();

	tag.name = "行容器";
	tag.isContainer = true;
	tag.styles["display"] = "flex";

	return tag;
}

// 列容器
export const colDivTag = function() {
	var tag = divTag();

	tag.name = "列容器";
	tag.isContainer = true;
	tag.styles["display"] = "flex";
	tag.styles["flex-direction"] = "column";

	return tag;
}

// 定义图片tag
export const imgTag = function() {
	var tag = tagFactory("img");
	tag.name = "图片";
	
	tag.attrs[":src"] = tag.varsPrefix + ".src";
	tag.vars = {
		src: "http://www.runoob.com/try/bootstrap/layoutit/v3/default3.jpg",
	}
	return tag;
}

// 文本
export const spanTag = function(text) {
	var tag = tagFactory("span");
	tag.name = "文本";

	tag.attrs["v-text"] = tag.varsPrefix + ".text";

	tag.vars = {
		text: text || "文本",
	}

	return tag;
}
// 标题
export const hTag = function(hn, text) {
	var tag = tagFactory(hn);
	tag.name = "标题";

	tag.attrs["v-text"] = tag.varsPrefix + ".text";

	tag.vars = {
		text: text ||  "这是一个标题",
	}

	return tag;
}

// 一级标题
export const h1Tag = function() {
	var tag = hTag("h1");
	tag.name = "一级标题";

	return tag;
}

// 二级标题
export const h2Tag = function() {
	var tag = hTag("h2");
	tag.name = "二级标题";

	return tag;
}

// 三级标题
export const h3Tag = function() {
	var tag = hTag("h3");
	tag.name = "三级标题";

	return tag;
}

// 段落
export const pTag = function(text) {
	var tag = tagFactory("p");
	tag.name = "段落";

	tag.attrs["v-text"] = tag.varsPrefix + ".text";
	tag.vars = {
		text: text || "这是一个段落",
	}

	return tag;
}


// 链接
export const aTag = function() {
	var tag = tagFactory("a");
	tag.name = "链接";

	tag.attrs[":href"] = tag.varsPrefix + ".href";
	tag.attrs["v-text"] = tag.varsPrefix + ".text";
	tag.vars = {
		text: "这是一个链接",
		href: "#",
	}

	return tag;
}

// 图标
export const iTag = function(){
	var tag = tagFactory("i");
	tag.name = "图标";

	tag.attrs.class = "el-icon-info";

	return tag;
}

// element ui base on vue 组件
export const elRowTag = function() {
	var tag = tagFactory("el-row");
	tag.name = "布局行";
	tag.isContainer = true;

	tag.attrList = [
	{
		name: "栅格间隔",
		attrName: ":gutter",
		defaultValue:"",
		desc: "栅格间隔",
	},
	];

	return tag;
}

export const elColTag = function() {
	var tag = tagFactory("el-col");
	tag.name = "布局列";
	tag.isContainer = true;

	tag.styles["min-height"] = "1px";
	tag.attrList = [
	{
		name: "栅格列数",
		attrName: ":span",
		defaultValue:"",
		desc: "栅格占据的列数",
	},
	{
		name: "偏移列数",
		attrName: ":offset",
		defaultValue:"",
		desc: "栅格左侧的间隔格数",
	},
	{
		name: "右移格数",
		attrName: ":push",
		defaultValue:"",
		desc: "栅格向右移动格数",
	},
	{
		name: "左移格数",
		attrName: ":pull",
		defaultValue:"",
		desc: "栅格向左移动格数",
	},
	];
	//tag.vars = [
		//{
			//text:"",
			//$data:{
				//type:"attr",  // 属性变量
				//attrName:":span",
				//key:"span", // 栅格间隔
			//},
		//},
		//{
			//text:"",
			//$data:{
				//type:"attr",  // 属性变量
				//attrName:":offset",
				//key:"offset", 
			//},
		//},
		//{
			//text:"",
			//$data:{
				//type:"attr",  // 属性变量
				//attrName:":push",
				//key:"push", 
			//},
		//},
		//{
			//text:"",
			//$data:{
				//type:"attr",  // 属性变量
				//attrName:":pull",
				//key:"pull", 
			//},
		//},
	//];

	return tag;
}

export const elContainerTag = function() {
	var tag = tagFactory("el-container");
	tag.name = "外层容器";
	tag.isContainer = true;
	
	tag.attrList = [
	{
		name: "方向",
		attrName: "direction",
		defaultValue:"",
		desc: "子元素的排列方向",
	},
	];
	//tag.vars = [
		//{
			//text:"",
			//$data:{
				//type:"attr",  // 属性变量
				//attrName:":direction",
				//key:"direction", // 栅格间隔
			//},
		//},
	//];

	return tag;
}

export const elHeaderTag = function() {
	var tag = tagFactory("el-header");
	tag.name = "顶栏容器";
	tag.isContainer = true;
	
	tag.attrList = [
	{
		name: "高度",
		attrName: "height",
		defaultValue:"",
		desc: "顶栏高度",
	},
	];
	//tag.vars = [
		//{
			//text:"",
			//$data:{
				//type:"attr",  
				//attrName:":height",
				//key:"height", 
			//},
		//},
	//];

	return tag;
}

export const elAsideTag = function() {
	var tag = tagFactory("el-aside");
	tag.name = "侧栏容器";
	tag.isContainer = true;
	
	tag.attrList = [
	{
		name: "宽度",
		attrName: "width",
		defaultValue:"",
		desc: "侧边栏宽度",
	},
	];
	//tag.vars = [
		//{
			//text:"",
			//$data:{
				//type:"attr",  
				//attrName:":width",
				//key:"width", 
			//},
		//},
	//];

	return tag;
}

export const elMainTag = function(){
	var tag = tagFactory("el-main");
	tag.name = "主区域容器";
	tag.isContainer = true;
	
	return tag;
}

export const elFooterTag = function(){
	var tag = tagFactory("el-footer");
	tag.name = "底栏容器";
	tag.isContainer = true;
	
	tag.attrList = [
	{
		name: "高度",
		attrName: "height",
		defaultValue:"",
		desc: "底栏高度",
	},
	];
	//tag.vars = [
		//{
			//text:"",
			//$data:{
				//type:"attr",  
				//attrName:":height",
				//key:"height", 
			//},
		//},
	//];

	return tag;
}

export const elButtonTag = function() {
	var tag = tagFactory("el-button");
	tag.name = "按钮";
	
	tag.attrs["v-text"] = tag.varsPrefix + ".text";
	tag.vars = {
		text: "按钮",
	}

	return tag;
	
}

export const wikiRichtextTag = function() {
	var tag = tagFactory("wiki-richtext");
	tag.name = "富文本";


	tag.vars = {
		text: {
			text:"富文本组件",
			//text:"",
			$data:{
				type:"text",
			},
		},
	};
	tag.attrs.style["min-height"] = "20px";
	
	return tag;
}

export const wikiMarkdownTag = function() {
	var tag = tagFactory("wiki-markdown");
	tag.name = "富文本";

	tag.vars = {
		text: {
			text:"富文本组件",
			//text:"",
			$data:{
				type:"text",
			},
		},
	};
	tag.attrs.style["min-height"] = "20px";
	
	return tag;
}


export const wikiCarouselTag = function() {
	var tag = tagFactory("wiki-carousel");
	tag.name = "走马灯";

	tag.vars = {
		items:{
			list:[],
			$data:{
				type:"list",
			},
		}
	};
	
	return tag;
}

export const htmlTag = function(text) {
	var tag = divTag();
	tag.attrs["v-html"] = tag.varsPrefix + ".text";
	tag.vars = {
		text: text == undefined ? "文本" : text,
	}

	return tag;
}

export const markdownTag = function(text) {
	var tag = tagFactory("markdown");
	tag.vars = {
		text: text == undefined ? "markdwon文本" : text,
	}

	tag.$vars = {
		text: {
			type:"text",  // 文件变量  用于标签内容显示
		}
	}

	console.log(tag);
	return tag;
}

export default {
	div: divTag,
	rowDiv: rowDivTag,
	colDiv: colDivTag,
	img: imgTag,
	span: spanTag,
	h: hTag,
	h1: h1Tag,
	h2: h2Tag,
	h3: h3Tag,
	p: pTag,
	a: aTag,
	i: iTag,
	elRow: elRowTag,
	elCol: elColTag,
	elContainer: elContainerTag,
	elHeader: elHeaderTag,
	elAside: elAsideTag,
	elMain: elMainTag,
	elFooter: elFooterTag,
	elButton: elButtonTag,
	html: htmlTag,
	markdown: markdownTag,
}

