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
 * @param	task	"deleteDirectory"
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
			.src(["./src/templates/dataInterface/Hoge.ts.ejs"])
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
		.src(["./src/templates/dataInterface/Hoge.ts.ejs"])
		.pipe(ejs({
			req: {
				name: `data`,
				interfaces: Object.keys(json).map(key => ({
					i_name: key,
					i_required: true,
					i_type: `Array<${key}Interface>`,
				})),
				imports: Object.keys(json).map(key => ({
					contents: [`${key}Interface`],
					path: `./${key}`
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
		.src(["./src/ejs/Contexts/*.ejs"])
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
	const funcList = json.FuncList;
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

	// Interface 配下の index.ts を生成する
	gulp
	.src(["./src/templates/Interfaces/index.ts.ejs"])
	.pipe(ejs({
		req: {
			paths: Array.from(serviseSet).map(x => `./${funcList.find(y => y.ServiceID === x).ServiceName}`)
		}
	}))
	.pipe(rename((path) => ({ 
		...path,
		extname: ""
	})))
	.pipe(gulp.dest(sBase));
	serviseSet.forEach(sid => {
		const sidFilteredInterfaces = interfaces.filter(x => x.func_id[0] === sid);
		const serviceNm = funcList.find(x => x.ServiceID === sid).ServiceName
		let dBase = sBase + serviceNm;
		const funcSet = new Set(sidFilteredInterfaces.map(x => x.func_id));

		// Service 配下の index.ts を生成する
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
		funcSet.forEach(fid => {
			const fidFilteredInterfaces = sidFilteredInterfaces.filter(x => x.func_id === fid);
			const func = funcList.find(x => x.FuncID === fid);
			let fdBase = dBase + "/" + fid;
			const iprSet = new Set(fidFilteredInterfaces.map(x => x.i_prefix));

			// Function 配下の index.ts を生成する
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

				// HogeInterface を生成する
				gulp
					.src(["./src/templates/Interfaces/HogeInterface.ts.ejs"])
					.pipe(ejs({
						req: {
							imports: [
								{
									contents: ["GeoPoint", "Timestamp", "DocumentReference", "DocumentSnapshot", "QuerySnapshot", "QueryDocumentSnapshot", "CollectionReference"],
									path: "@firebase/firestore"
								},
								{
									default: "React",
									contents: ["ReactNode"],
									path: "react"
								},
								{
									contents: ["GooglePlaceData", "GooglePlaceDetail"],
									path: "react-native-google-places-autocomplete"
								},
							],
							name: `${func.FuncName}${ipr}`,
							interfaces: iprFilteredInterfaces
						}
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
 * Create Consts files.
 * @param	task	"Consts"
 * @param	arg1	distBase
 ************************************************************************************/
gulp.task("Consts", async done => {
	distBase = options.arg1 || distBase;
	/**
	 * @type dataInterface
	 */
	const json = await getData();
	const consts = json.CONST;
	const funcList = json.FuncList;
	new Set(consts.map(con => con.ServiceID)).forEach(serviceID => {
		const serviceName = funcList.find(f => f.ServiceID === serviceID).ServiceName
		gulp
			.src(["./src/templates/Consts/index.ts.ejs"])
			.pipe(ejs({
				req: {
					service: serviceName,
					consts: consts.filter(c => c.ServiceID === serviceID)
						.map(c => (
						{
							key: c.key,
							value: c.value
						}))
				}
			}))
			.pipe(rename((path) => ({ 
				...path,
				extname: ""
			})))
			.pipe(gulp.dest(`${distBase}/Consts/${serviceName}`));
	})
	done();
});

/************************************************************************************
 * Create Models files.
 * @param	task	"Models"
 * @param	arg1	distBase
 ************************************************************************************/
gulp.task("Models", async done => {
	distBase = options.arg1 || distBase;
	/**
	 * @type dataInterface
	 */
	const json = await getData();
	const funcList = json.FuncList;
	const tables = json.TABLES;
	const columns = json.T_COLUMNS;

	new Set(tables.map(tab => tab.t_id[0])).forEach(serviceID => {
		const serviceName = funcList.find(f => f.ServiceID === serviceID).ServiceName
		tables.filter(tab => tab.t_id[0]===serviceID).forEach(tab => {
			gulp
				.src(["./src/templates/Models/Hoge.ts.ejs"])
				.pipe(ejs({
					req: {
						ID: tab.t_id,
						name: tab.t_name,
						cols: columns.filter(c => c.t_id === tab.t_id)
							.map(c => (
							{
								...c,
								c_datatype: ["Array", "Object"].includes(c.c_datatype) ? c.memo : c.c_datatype,
								data_type: json.DATA_TYPE.find(d => d.JSType === c.c_datatype)
							}))
					}
				}))
				.pipe(rename((path) => ({ 
					...path,
					basename: path.basename.replace('Hoge', `${tab.t_name}`),
					extname: ""
				})))
				.pipe(gulp.dest(`${distBase}/Models/${serviceName}/${tab.t_id}`));
			})
		})
	done();
});
