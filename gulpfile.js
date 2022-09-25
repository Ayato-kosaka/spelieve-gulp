import gulp from "gulp";
import fetch from 'node-fetch';
import rename from "gulp-rename";
import ejs from "gulp-ejs";
import minimist from "minimist";
import dotenv from 'dotenv';
import { deleteAsync } from 'del';
dotenv.config();

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
 * @typedef { import("./dev/dataInterface").dataInterface } dataInterface
 */

/**
 * @type {Promise<dataInterface>}
 */
const getData = async () => {
	const response = await fetch(process.env.PG_DATA_ENDPOINT/* as RequestInfo */);
	return await response.json();
};


/**
 * Create gulp/dataInterface directory files.
 * @param	task	"gulp/dataInterface"
 */
let taskNm = "dev/dataInterface"
 gulp.task(taskNm, async done => {
	await deleteAsync(`./${taskNm}`)
	/**
	 * @type dataInterface
	 */
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
	/**
	 * @type dataInterface
	 */
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
	/**
	 * @type dataInterface
	 */
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
 */
gulp.task("Interfaces", async done => {
	/**
	 * @type dataInterface
	 */
	const json = await getData();
	const funcList = json.FuncList;
	const interfaces = json.INTERFACE;

	const serviseSet = new Set(interfaces.map(x => x.func_id[0]));
	const sBase = distBase + "/Interface/";
	gulp
		.src(["./ejs/Index/index.ts.ejs"])
		.pipe(ejs({
			paths: Array.from(serviseSet).map(x => `./${funcList.find(y => y.ServiceID === x).ServiceName}`)
		}))
		.pipe(rename((path) => ({ 
			...path,
			extname: ""
		})))
		.pipe(gulp.dest(sBase));
	done();
	serviseSet.forEach(sid => {
		const sidFilteredInterfaces = interfaces.filter(x => x.func_id[0] === sid);
		const serviceNm = funcList.find(x => x.ServiceID === sid).ServiceName
		let dBase = sBase + serviceNm;
		const funcSet = new Set(sidFilteredInterfaces.map(x => x.func_id));
		gulp
			.src(["./ejs/Index/index.ts.ejs"])
			.pipe(ejs({
				paths: Array.from(funcSet).map(x => `./${x}`)
			}))
			.pipe(rename((path) => ({ 
				...path,
				extname: ""
			})))
			.pipe(gulp.dest(dBase));
		done();
		funcSet.forEach(fid => {
			const fidFilteredInterfaces = sidFilteredInterfaces.filter(x => x.func_id === fid);
			const func = funcList.find(x => x.FuncID === fid);
			let fdBase = dBase + "/" + fid;
			const iprSet = new Set(fidFilteredInterfaces.map(x => x.i_prefix));
			gulp
				.src(["./ejs/Index/index.ts.ejs"])
				.pipe(ejs({
					paths: Array.from(iprSet).map(x => `./${func.FuncName}${x}Interface`)
				}))
				.pipe(rename((path) => ({ 
					...path,
					extname: ""
				})))
				.pipe(gulp.dest(fdBase));
			iprSet.forEach(ipr => {
				const iprFilteredInterfaces = fidFilteredInterfaces.filter(i => i.i_prefix === ipr);
				gulp
					.src(["./ejs/Interface/HogeInterface.ts.ejs"])
					.pipe(ejs({
						name: `${func.FuncName}${ipr}`,
						interfaces: iprFilteredInterfaces
					}))
					.pipe(rename((path) => ({ 
						...path,
						basename: path.basename.replace('Hoge', `${func.FuncName}${ipr}`),
						extname: ""
					})))
					.pipe(gulp.dest(fdBase));
			})
		})
	})
	done();
});