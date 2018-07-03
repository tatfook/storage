<template>
	<div v-if="isClient">
		<el-dialog :visible.sync="isShowBoard" :fullscreen="true">
			<div ref="mxClient"></div>
			<div class="mx-client mx-client-cancel" @click="isShowBoard = false">取消</div>
			<div class="mx-client mx-client-confirm" @click="saveBoardData">确定</div>
		</el-dialog>
		<div v-if="!isShowBoard">
			<div v-on:click="clickEditBtn">
				<div v-html="svg"></div>
			</div>
		</div>
	</div>
</template>

<script>
import {
	Button,
	Dialog,
	Message,
} from "element-ui";
import _ from 'lodash'

const loadBoardBundle = async function() {
	return await new Promise((resolve, reject) => {
		if (!window.mxClient.isBrowserSupported()) {
			//mxClientEle.innerHTML("Browser is not supported!");
			resolve();
		}

		window.mxResources.loadDefaultBundle = false;
		let bundle = window.mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || window.mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

		//window.STYLE_PATH = window.STYLE_PATH.substring(1);
		window.mxUtils.getAll([bundle, window.STYLE_PATH + '/default.xml'], function (xhr) {
			window.mxResources.parse(xhr[0].getText());
			let themes = new Object();
			themes[window.Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

			resolve(themes);
		}, function () {
			resolve();
			//document.querySelector("#mx-client").innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
		});
	});
}

export default {
	components:{
		[Button.name]: Button,
		[Dialog.name]: Dialog,
	},

	data() {
		return {
			data: "",
			initBoard: false,
			isShowBoard: false,
			isClient: false,
			svg: '<div class="mx-client-start">点击编辑</div>',
		}
	},

	methods: {
		clickEditBtn() {
			const self = this;

			if (!self.boardTheme) return;

			self.isShowBoard = true;

			setTimeout(function() {
				const mxClientEle = self.$refs.mxClient;
				const data = self.data;
				self.ui = new window.EditorUi(new window.Editor(urlParams['chrome'] == '0', self.boardTheme), mxClientEle);
				if (data && data.replace(/[\ \r\n]+/g, "").length > 0 && data.replace(/[\ \r\n]+/g, "") != "blank") {
					const doc = self.ui.editor.graph.getDecompressData(data);
					self.ui.editor.setGraphXml(doc.documentElement);
				}
			});
		},
		saveBoardData() {
			const self = this;
			self.data = self.ui.getCurrentCompressData()
			self.isShowBoard = false;
			
			const data = self.data;
			const container = document.createElement('div')
			const graph = new window.Graph(container, null, null, null, self.boardTheme)

			let mxGraphModelData

			if (data) {
				mxGraphModelData = graph.getDecompressData(data)
			}

			let decoder = new window.mxCodec(mxGraphModelData)
			let node = mxGraphModelData.documentElement

			graph.centerZoom = false
			graph.setTooltips(false)
			graph.setEnabled(false)

			decoder.decode(node, graph.getModel())

			let svg = container.querySelector('svg')
			svg.style.backgroundImage = null

			self.svg = container.innerHTML;
		},
	},

	mounted() {
		const self = this;
	    self.isClient = true;
		
		const loadBoard = async () => {
			if (!window.mxClient) {
				return setTimeout(loadBoard, 1000);
			}

			self.boardTheme = await loadBoardBundle();
		}

		if (!window.mxClient && process.client) {
			window.mxBasePath = "/static/board/mxgraph";
			window.RESOURCES_PATH = "/static/board/resources";
			window.STYLE_PATH = "/static/board/styles";

			let boardScript = document.createElement('script')
			//boardScript.setAttribute('src', '/static/adi/board/keepwork-board.min.js')
			boardScript.setAttribute('src', '/static/board/js/app.min.js')

			let graphEditorCss = document.createElement('link')
			graphEditorCss.setAttribute('rel', 'stylesheet')
			graphEditorCss.setAttribute('type', 'text/css')
			//graphEditorCss.setAttribute('href', '/static/adi/board/assets/styles/grapheditor.css')
			graphEditorCss.setAttribute('href', '/static/board/styles/grapheditor.css')

			let body = document.querySelector('body')
			body.appendChild(boardScript)
			body.appendChild(graphEditorCss)
		}

		loadBoard();
	},

	created() {
	}
}
</script>

<style>
.mxWindow {
  z-index: 3000 !important;
}
</style>


<style lang="scss">
.mx-client-start {
    background-color: #dedede;
    color: #333;
    height: 100px;
    font-size: 20px;
    align-items: center;
    display: flex;
    justify-content: center;
 }
.mx-client {
  position: absolute;
  right: 0;
  top: 0px;
  z-index: 9999;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  background-color: #4d90fe;
  background-image: linear-gradient(top, #4d90fe, #4787ed);
  border: 1px solid #3079ed;
  color: #fff;
  border-radius: 2px;
  cursor: default;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  margin-right: 16px;
  height: 27px;
  line-height: 27px;
  min-width: 54px;
  outline: 0px;
  width: 90px;
  padding: 0 8px;
  padding: 0 8px;
  cursor: pointer;
}

.mx-client-cancel {
	right: 100px;	
}
.mx-client-confirm {

}
</style>
