import fetch from 'node-fetch';
import gulp from "gulp";
import rename from "gulp-rename";
import ejs from "gulp-ejs";
import minimist from "minimist";
import dotenv from 'dotenv';
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


const getData = async () => {
  try {
    const response = await fetch(process.env.PG_DATA_ENDPOINT);
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create Models directory files.
 * @param	task	"Models"
 * @param	arg1	TableID (ex: IDB001)
 */
gulp.task("Models", async done => {
	const t_id = options.arg1
	const json = await getData();
    const table = json.TABLES.find(j => j.t_id === t_id);
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
	const interfaces = json.INTERFACE;
	const funcList = json.FuncList;
	new Set(interfaces.map(x => x.func_id)).forEach(fid => {
		if(func_id && func_id !== fid){ return; }
		const fidFilteredList = interfaces.filter(i => i.func_id === fid);
		new Set(fidFilteredList.map(x => x.i_prefix)).forEach(ipr => {
			if(i_prefix && i_prefix !== ipr){ return; }
			const list = fidFilteredList.filter(i => i.i_prefix === ipr);
			const func = funcList.find(x => x.FuncID === fid);
			gulp
				.src(["./ejs/Interfaces/*.ejs"])
				.pipe(ejs({
					interfaces: list
				}))
				.pipe(rename((path) => ({ 
				    dirname: `./Interfaces/${func.ServiceName}/${func.FuncID}`,
				    basename: path.basename.replace('Hoge', `${func.FuncName}${ipr}`),
				    extname: ""
		        })))
				.pipe(gulp.dest(distBase));
		})
	})
	done();
});