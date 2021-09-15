<template>
	<div id="A-button" :style="buttonStyle">
		{{ name }}
	</div>
</template>

<script>
import props from './a-button-props';

export default {
	name: 'A-button',
	props,
	data() {
		return {
			buttonStyle: {
				width: this.width,
				height: this.height,
				'line-height': this.height,
				background: this.backgroundColor,
				'font-size': this.font,
				'border-radius': this.round,
			},
		};
	},
};
</script>

<style lang="scss" scoped>
#A-button {
	text-align: center;
	color: white;
}
</style>
