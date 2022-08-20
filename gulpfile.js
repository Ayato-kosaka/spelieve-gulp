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
  string: 'arg1',
  default: {
    arg1: '',
    arg2: ''
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
 * @param	param1	TableID (ex: IDB001)
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
 * @param	param1	FunctionID (ex: ICT001)
 * @param	param2	TableID (ex: IDB001)
 * @param	param3	option ("readOne" | "readArray" | "readMap")
 */
gulp.task("Contexts", async done => {
	const func_id = options.arg1;
	const t_id = options.arg2;
	const option = options.arg3;
	const json = await getData();
	const func = json["機能一覧"].find(j => j["機能ＩＤ"] === func_id);
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
		    dirname: "./"+func_id+func["機能名"],
		    basename: path.basename.replace('Hoge', table.t_name),
		    extname: ""
        })))
		.pipe(gulp.dest(distBase));
	done();
})