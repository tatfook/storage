<template>
	<div>
		<oauthLogin></oauthLogin>
	</div>
</template>

<script>
import vue from "vue";
import * as qiniu from "qiniu-js";
import axios from "axios";
import api from "@@/common/api/note.js";
import qiniuUpload from "@@/common/api/qiniu.js";
import tag from "@/components/common/tag.js";
import {tags} from "@/lib/tags";
import oauthLogin from "@/components/views/oauthLogin.vue";

export default {
	components: {
		oauthLogin,
	},

	data: function() {
		return {
		}
	},

	methods: {
	},

	async mounted() {
		const ok = await qiniuUpload("abc", "hello world", "LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq:wigxcLc_qIKAJ0VAysZb5oeebVA=:eyJjYWxsYmFja0JvZHlUeXBlIjoiYXBwbGljYXRpb24vanNvbiIsImNhbGxiYWNrQm9keSI6IntcImtleVwiOlwiJChrZXkpXCIsXCJoYXNoXCI6XCIkKGV0YWcpXCIsXCJzaXplXCI6JChmc2l6ZSksXCJidWNrZXRcIjpcIiQoYnVja2V0KVwiLFwiZmlsZW5hbWVcIjpcIiQoeDpmaWxlbmFtZSlcIixcInNpdGVJZFwiOiQoeDpzaXRlSWQpfSIsImNhbGxiYWNrVXJsIjoiaHR0cDovLzQ3LjUyLjIwLjM0OjgwODgvYXBpL3YwL2ZpbGVzL3Fpbml1Iiwic2NvcGUiOiJrZWVwd29yay1kZXY6YWJjIiwiZGVhZGxpbmUiOjE1MzAyMzc3NTR9");
		console.log(ok);
	}
}
</script>

