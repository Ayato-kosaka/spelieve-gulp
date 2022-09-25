import gulp from "gulp";
import rename from "gulp-rename";
import ejs from "gulp-ejs";
import minimist from "minimist";
import dotenv from 'dotenv';
import { deleteAsync } from 'del';
dotenv.config();
import { getData } from './dev/getData'

const srcBase = '.';
const distBase = './dist';

const options = minimist(process.argv.slice(2), {
  string: ['arg1', 'arg2', 'arg3'],
  default: {
    arg1: '',
    arg2: '',
    arg3: '',
  }
});




/**
 * Create gulp/dataInterface directory files.
 * @param	task	"gulp/dataInterface"
 */
let taskNm = "dev/dataInterface"
 gulp.task(taskNm, async done => {
	await deleteAsync(`./${taskNm}`)
	const json = await getData();
	Object.keys(json).forEach(dataNm => {
		const nowData = json[dataNm];
		gulp
			.src(["./ejs/Interface/HogeInterface.ts.ejs"])
			.pipe(ejs({
				name: `${dataNm}`,
				interfaces: Object.keys(nowData[0]).map(key => ({
					i_name: key,
					i_required: true,
					i_type: "string",
				}))
			}))
			.pipe(rename((path) => ({ 
				dirname: `./${taskNm}`,
				basename: path.basename.replace('Hoge', `${dataNm}`),
				extname: ""
			})))
			.pipe(gulp.dest("./"));
	})
	console.log(Object.keys(json).map(key => ({
		i_name: key,
		i_required: true,
		i_type: `Array<${key}Interface>`,
	})))
	gulp
		.src(["./ejs/Interface/index.ts.ejs"])
		.pipe(ejs({
			name: `data`,
			interfaces: Object.keys(json).map(key => ({
				i_name: key,
				i_required: true,
				i_type: `Array<${key}Interface>`,
			})),
			imports: Object.keys(json).map(key => ({
				as: `${key}Interface`,
				path: `./${key}Interface`
			}))
		}))
		.pipe(rename((path) => ({ 
			dirname: `./${taskNm}`,
			basename: "index.ts",
			extname: ""
		})))
		.pipe(gulp.dest("./"));
	done();
});


/**
 * Create Models directory files.
 * @param	task	"Models"
 * @param	arg1	TableID (ex: IDB001)
 */
gulp.task("Models", async done => {
	const t_id = options.arg1
	const json = await getData();
    const table = json.TABLES.find(j => j.t_id === t_id);
	if(!table) {
		console.log("data not found");
		return;
	}
    const columns = json.T_COLUMNS.filter(j => j.t_id === t_id);
    const dataType = json.DATA_TYPE;
	gulp
		.src(["./ejs/Models/*.ejs"])
		.pipe(ejs({
			table: table,
			columns: columns,
			dataType: dataType,
		}))
		.pipe(rename((path) => ({ 
		    dirname: "./"+table.t_id+table.t_name,
		    basename: path.basename.replace('Hoge', table.t_name),
		    extname: ""
        })))
		.pipe(gulp.dest(distBase));
	done();
});

/**
 * Create Contexts directory files.
 * @param	task	"Contexts"
 * @param	arg1	FunctionID (ex: ICT001)
 * @param	arg2	TableID (ex: IDB001)
 * @param	arg3	option ("readOne" | "readArray" | "readMap")
 */
gulp.task("Contexts", async done => {
	const func_id = options.arg1;
	const t_id = options.arg2;
	const option = options.arg3;
	const json = await getData();
	const func = json.FuncList.find(j => j.FuncID === func_id);
	const table = json.TABLES.find(j => j.t_id === t_id);
	const columns = json.T_COLUMNS.filter(j => j.t_id === t_id);
	const dataType = json.DATA_TYPE;
	if(!func || !table) {
		console.log("data not found");
		return;
	}
	gulp
		.src(["./ejs/Contexts/*.ejs"])
		.pipe(ejs({
			func: func,
			option: option,
			table: table,
			columns: columns,
			dataType: dataType,
		}))
		.pipe(rename((path) => ({ 
		    dirname: "./"+func_id+func.FuncName,
		    basename: path.basename.replace('Hoge', table.t_name),
		    extname: ""
        })))
		.pipe(gulp.dest(distBase));
	done();
})

/**
 * Create Interface files.
 * @param	task	"Interfaces"
 * @param	arg1	func_id? (ex: IDB001)
 * @param	arg2	i_prefix? (ex: Props)
 */
gulp.task("Interfaces", async done => {
	const func_id = options.arg1;
	const i_prefix = options.arg2;
	const json = await getData();
	const funcList = json.FuncList;

	const interfaces = json.INTERFACE;
	new Set(interfaces.map(x => x.func_id)).forEach(fid => {
		if(func_id && func_id !== fid){ return; }
		const fidFilteredList = interfaces.filter(i => i.func_id === fid);
		new Set(fidFilteredList.map(x => x.i_prefix)).forEach(ipr => {
			if(i_prefix && i_prefix !== ipr){ return; }
			const list = fidFilteredList.filter(i => i.i_prefix === ipr);
			const func = funcList.find(x => x.FuncID === fid);
			if(!func) {
				console.log("data not found");
				return;
			}
			gulp
				.src(["./ejs/Interface/HogeInterface.ts.ejs"])
				.pipe(ejs({
					name: `${func.FuncName}${ipr}`,
					interfaces: list
				}))
				.pipe(rename((path) => ({ 
				    dirname: `./${func.ServiceName}/${func.FuncID}`,
				    basename: path.basename.replace('Hoge', `${func.FuncName}${ipr}`),
				    extname: ""
		        })))
				.pipe(gulp.dest(distBase+"/Interfaces"));
		})
	})

	
    // const columns = json.T_COLUMNS;
    // const dataType = json.DATA_TYPE;
	// new Set(columns.map(x => x.t_id)).forEach(fid => {
	// 	if(func_id && func_id !== fid){ return; }
	// 	const list = columns.filter(c => c.t_id === fid);
	// 	const func = funcList.find(x => x.FuncID === fid);
	// 	gulp
	// 		.src(["./ejs/Models/*.ejs"])
	// 		.pipe(ejs({
	// 			columns: list,
	// 			dataType: dataType,
	// 			name: func.FuncName,
	// 		}))
	// 		.pipe(rename((path) => ({ 
	// 			dirname: `./${func.ServiceName}/${fid}`,
	// 			basename: path.basename.replace('Hoge', func.FuncName),
	// 			extname: ""
	// 		})))
	// 		.pipe(gulp.dest(distBase+"/Interfaces"));
	// })
	done();
});