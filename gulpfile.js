import gulp from "gulp";
import fetch from 'node-fetch';
import rename from "gulp-rename";
import ejs from "gulp-ejs";
import minimist from "minimist";
import dotenv from 'dotenv';
import { deleteAsync } from 'del';
dotenv.config();

const srcBase = '.';
let distBase = './dist';

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
 * @typedef { import("./dev/dataInterface/FuncList").FuncListInterface } FuncListInterface
 */

/**
 * @type {Promise<dataInterface>}
 */
const getData = async () => {
	const response = await fetch(process.env.PG_DATA_ENDPOINT/* as RequestInfo */);
	return await response.json();
};

/************************************************************************************
 * Delete arg1 directory.
 * @param	task	"gulp/dataInterface"
 * @param	arg1	directoryPath
 ************************************************************************************/
 gulp.task("deleteDirectory", async done => {
	const directoryPath = options.arg1;
	await deleteAsync(`${directoryPath}`)
	done()
 });



/************************************************************************************
 * Create dev/dataInterface directory files.
 * @param	task	"dev/dataInterface"
 ************************************************************************************/
let taskNm = "dev/dataInterface"
 gulp.task(taskNm, async done => {
	await deleteAsync(`./${taskNm}`)
	/**
	 * @type dataInterface
	 */
	const json = await getData();
	
	Object.keys(json).forEach(key => {
		const nowData = json[key];
		gulp
			.src(["./src/dataInterface/Hoge.ts.ejs"])
			.pipe(ejs({
				req: {
					name: `${key}`,
					interfaces: Object.keys(nowData[0]).map(key => ({
						i_name: key,
						i_required: true,
						i_type: "string",
					}))
				}
			}))
			.pipe(rename((path) => ({ 
				dirname: `./${taskNm}`,
				basename: path.basename.replace('Hoge', `${key}`),
				extname: ""
			})))
			.pipe(gulp.dest("./"));
	})
	
	gulp
		.src(["./src/dataInterface/Hoge.ts.ejs"])
		.pipe(ejs({
			req: {
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
			}
		}))
		.pipe(rename((path) => ({ 
			dirname: `./${taskNm}`,
			basename: "index.ts",
			extname: ""
		})))
		.pipe(gulp.dest("./"));
	done();
});


/************************************************************************************
 * Auto Generate Contexts skelton files.
 * @param	task	"Contexts"
 * @param	arg1	FunctionID (ex: ICT001)
 * @param	arg2	TableID (ex: IDB001)
 * @param	arg3	option ("readOne" | "readArray" | "readMap")
 ************************************************************************************/
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
		    basename: path.basename.replace('Hoge', func.FuncName),
		    extname: ""
        })))
		.pipe(gulp.dest(distBase));
	done();
})

/************************************************************************************
 * Create Interface files.
 * @param	task	"Interfaces"
 * @param	arg1	distBase
 ************************************************************************************/
gulp.task("Interfaces", async done => {
	distBase = options.arg1 || distBase;
	/**
	 * @type dataInterface
	 */
	const json = await getData();
	const funcList = json.FuncList[0];
	function colToInterface(c, dtcol){return {
		func_id: c.t_id,
		i_prefix: '',
		i_name: c.c_name,
		i_required: c.c_required,
		i_type: function (){
			if(["array", "map"].includes(c.c_datatype)){
				return c.memo;
			} else {
				return json.DATA_TYPE.find(x => x.FirestoreType === c.c_datatype)[dtcol];
			}
		}(),
	}}
	
	// INTERFACE と T_COLUMNS を統合する
	const interfaces = json.INTERFACE
		.concat(json.T_COLUMNS.map(c => colToInterface(c, "DBType")))
		.concat(json.FuncList.filter(f => f.FuncType === "Context")
			.map(f => json.T_COLUMNS
				.filter(c => c.t_id === `${f.FuncID[0]}DB${f.FuncID.substring(3,5)}`
					&& !json.INTERFACE.filter(i => i.func_id === f.FuncID
							&& i.i_prefix === '')
						.map(i => i.i_name).includes(c.c_name))
				.map(c => ({...colToInterface(c, "CTType"),
					func_id: f.FuncID
				}))
			).flat()
		);
	const serviseSet = new Set(interfaces.map(x => x.func_id[0]));
	const sBase = distBase + "/Interfaces/";
	serviseSet.forEach(sid => {
		const sidFilteredInterfaces = interfaces.filter(x => x.func_id[0] === sid);
		const serviceNm = funcList.find(x => x.ServiceID === sid).ServiceName
		let dBase = sBase + serviceNm;
		const funcSet = new Set(sidFilteredInterfaces.map(x => x.func_id));
		gulp
			.src(["./src/templates/Interfaces/index.ts.ejs"])
			.pipe(ejs({
				req: {
					paths: Array.from(funcSet).map(x => `./${x}`)
				}
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
				.src(["./src/templates/Interfaces/index.ts.ejs"])
				.pipe(ejs({
					req: {
						paths: Array.from(iprSet).map(x => `./${func.FuncName}${x}Interface`)
					}
				}))
				.pipe(rename((path) => ({ 
					...path,
					extname: ""
				})))
				.pipe(gulp.dest(fdBase));
			iprSet.forEach(ipr => {
				const iprFilteredInterfaces = fidFilteredInterfaces.filter(i => i.i_prefix === ipr);
				gulp
					.src(["./ejs/Interface/*.ejs"])
					.pipe(ejs({
						name: `${fid}${func.FuncName}${ipr}`,
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

/************************************************************************************
 * Create Funclist files.
 * @param	task	"FuncList"
 * @param	arg1	distBase
 ************************************************************************************/
gulp.task("FuncList", async done => {
	distBase = options.arg1 || distBase;
	/**
	 * @type dataInterface
	 */
	const json = await getData();
	const funcList = json.FuncList;
	gulp
		.src(["./src/templates/FuncList/index.ts.ejs"])
		.pipe(ejs({
			req: {
				consts: funcList.map(func => (
					{
						key: func.FuncID,
						value: JSON.stringify({'name': func.FuncName}, null , "\t")
					}))
			}
		}))
		.pipe(rename((path) => ({ 
			...path,
			extname: ""
		})))
		.pipe(gulp.dest(distBase + "/Functions/"));
	done();
});
