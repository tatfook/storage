<template>
	<codemirror v-if="isClient" ref="cm"></codemirror>
</template>

<script>
import vue from "vue";

function getEmptyLine(editor, lineNo) {
	lineNo = lineNo || editor.getCursor().line || 0;

	var content = editor.getLine(lineNo);
	while (content){
		content = editor.getLine(++lineNo);
	}
	if (content == undefined){
		editor.replaceRange("\n",{line: lineNo, ch: 0});
	}
	return lineNo;
}

function line_keyword_nofocus(editor, lineNo, content) {
	lineNo = lineNo || getEmptyLine(editor);

	const originContent = editor.getLine(lineNo);
	const offsetX = originContent && originContent.length;
	editor.replaceRange(content, CodeMirror.Pos(lineNo, 0), CodeMirror.Pos(lineNo, offsetX));
};
	// 折叠wiki代码
function foldWikiBlock(cm, changeObj) {
	if (!changeObj) {
		return;
	}
	var start = -1, end = -1;
	for (var i = 0; i < changeObj.text.length; i++) {
		//cm.getDoc().removeLineClass(changeObj.from.line + i, 'wrap', 'CodeMirrorFold');
		if (/^```[@\/]/.test(changeObj.text[i])) {
			start = i;
		}
		if (start >= 0 && /^```/.test(changeObj.text[i])) {
			end = i;
		}
		if (start >= 0 && end >= 0) {
			cm.foldCode({line: changeObj.from.line + start, ch: changeObj.from.ch}, null, 'fold');
			start = end = -1;
		}
	}

	if (changeObj.origin == "setValue") {
		return;
	}

	start = end = -1;
	for (var i = 0; i < changeObj.removed.length; i++) {
		//cm.getDoc().removeLineClass(changeObj.from.line + i, 'wrap', 'CodeMirrorFold');
		if (/^```[@\/]/.test(changeObj.removed[i])) {
			start = i;
		}
		if (start >= 0 && /^```/.test(changeObj.removed[i])) {
			end = i;
		}
		if (start >= 0 && end >= 0) {
			cm.getDoc().removeLineClass(changeObj.from.line + i, 'wrap', 'CodeMirrorFold');
			start = end = -1;
		}
	}
}

function wrapfunc(self, funcname) {
	return function(...args) {
		(self[funcname])(...args);
	}
}

export default {
	data: function() {
		var self = this;
		return {
			isClient: false,
			keyMap:{
				"Ctrl-S": function(cm) {
					self.$emit("save", {
						filename: self.currentFilename,
						text:self.codemirror.getValue()
					});
				},
			},
		};
	},

	props: {
		options: {
			type: Object,
			default: function(){
				return {
				}
			},
		},
		value:{
			type:Object,
			default: function() {
				return {
				};
			}
		}
	},

	computed: {
		text() {
			return this.value.text || "";
		},
	},
	watch: {
		"value": function(val) {
			if (this.codemirror) {
				this.swapDoc(val.filename, val.text);	
				val.cursor && this.codemirror.setCursor(val.cursor);
			}
		},
	},
	methods: {
		initCodeMirror() {
			var self = this;

			self.codemirror.setSize("100%", "100%");
			self.originDoc = self.codemirror.getDoc();

			self.codemirror.on("change", function (cm, changeObj) {
				// 代码折叠
				foldWikiBlock(cm, changeObj);

				// change
				var text = self.codemirror.getValue();

				self.$emit("change", {filename:self.currentFilename, text:text});
			});

			self.codemirror.on("cursorActivity", function(cm){
				var pos = self.codemirror.getCursor();
				self.$emit("cursorActivity", pos);
				//self.codemirror.focus();
			});

			self.codemirror.on("paste", function(cm, e) {
				//console.log(e);
				if (!(e.clipboardData && e.clipboardData.items.length)) {
					alert("该浏览器不支持操作");
					return;
				}
				for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
					const item = e.clipboardData.items[i];
					// console.log(item.kind+":"+item.type);
					if (item.kind === "string") {
						item.getAsString(function (str) {
							// str 是获取到的字符串
							//console.log('get str');
							//console.log(str);
						})
					} else if (item.kind === "file") {
						var file = item.getAsFile();
						// pasteFile就是获取到的文件
						self.$emit("fileUpload", file);
					}
				}
			});
			
			self.codemirror.on("drop", function(cm, e){
				if (!(e.dataTransfer && e.dataTransfer.files.length)) {
					alert("该浏览器不支持操作");
					return;
				}
				for (var i = 0; i < e.dataTransfer.files.length; i++) {
					var file = e.dataTransfer.files[i];
					self.$emit("fileUpload", file);
				}
				e.preventDefault();
			});
	
			self.codemirror.setOption("extraKeys", this.keyMap);

			self.codemirror.setValue(self.text);
		},

		swapDoc(filename, text) {
			text = text || "";
			if (filename) {
				if (!this.docMap[filename]) {
					this.docMap[filename] = this.CodeMirror.Doc(text, 'markdown');
				}
				this.codemirror.swapDoc(this.docMap[filename]);
			} else {
				this.codemirror.swapDoc(this.originDoc);
			}
			this.currentFilename = filename;
			if (text) {
				this.codemirror.setValue(text);
			} else {
				this.CodeMirror && this.CodeMirror.signal(this.codemirror, "change", this.codemirror);
			}
		},
		insertContent(content, lineNo) {
			line_keyword_nofocus(this.codemirror, lineNo, content);
		},
		getValue() {
			return {
				filename: this.currentFilename,
				text: this.codemirror.getValue(),
			};	
		},
	},
	created() {
		this.docMap = {};	
		this.currentFilename = undefined;
	},
	mounted() {
		const self = this;
		self.isClient = true;
		const timer = setInterval(()=> {
			if (!self.$refs.cm || !self.$refs.cm.codemirror) return;
			clearInterval(timer);
			self.codemirror = self.$refs.cm.codemirror;
			self.CodeMirror = this.CodeMirror || require("codemirror");
			self.initCodeMirror();
			self.swapDoc(self.value.filename, self.value.text);	
		}, 100);
	},

	inheritAttrs:false,
}
</script>
