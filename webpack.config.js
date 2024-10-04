const path = require('path'); // Импортируем модуль "path" для работы с путями файлов
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js', // Точка входа для сборки проекта

	output: {
		filename: 'bundle.js', // Имя выходного файла сборки
		path: path.resolve(__dirname, 'dist'), // Путь для выходного файла сборки
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},

			// {
			// 	test: /\.css$/, // Регулярное выражение для обработки файлов с расширением .css
			// 	use: ['style-loader', 'css-loader'], // Загрузчики, используемые для обработки CSS-файлов
			// },
		],
	},

	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ],
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/simple_charge/index.html',
			filename: 'simple_charge/index.html',
		}),
	],

	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'), // Каталог для статики
		},
		open: true, // Автоматически открывать браузер
	},

	mode: 'production', // Режим сборки
};