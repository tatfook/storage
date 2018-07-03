
<template>
	<el-table :data="sites">
		<el-table-column fixed prop="sitename" label="名称"></el-table-column>
		<el-table-column fixed prop="description" label="描述"></el-table-column>
		<el-table-column fixed prop="private" label="私有"></el-table-column>
		<el-table-column fixed="right" label="操作">
			<template slot-scope="{row, $index}">
				<el-button type="text" @click="clickDeleteBtn(row, $index)">删除</el-button>
			</template>
		</el-table-column>
	</el-table>
</template>


<script>
import {
	Button,
	Table,
	TableColumn,
	Message,
} from "element-ui";
import {mapActions, mapGetters} from "vuex";
import api from "@@/common/api/note.js";

export default {
	components: {
		[Button.name]: Button,
		[Table.name]: Table,
		[TableColumn.name]: TableColumn,
	},

	data: function() {
		return {
			sites: [],
		}
	},

	methods: {
		async clickDeleteBtn(site, index) {
			const result = await api.sites.delete(site);
			if (result.isErr()) {
				Message(result.getMessage());
				return;
			}

			this.sites.splice(index,1);
		},
	},

	async mounted() {
		let result = await api.sites.get();
		if (result.isErr()) {
			Message(result.getMessage());
			return;
		}
		
		this.sites = result.getData() || [];

		return;
	},
}
</script>
