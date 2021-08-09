/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SQLParser from '../../index';
import TestModel from '../../models/testModel';

dotenv.config();

describe('Dev test like operator', () => {
  beforeAll(() => {
    mongoose.connect(process.env.CONNECT_STRING_TEST as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  it('Test simple statement start with like operator', async () => {
    const sqlWhereConditon = `WHERE name like '%Graham'`;
    const parser = new SQLParser();
    const data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(data[0].name).endsWith('Graham'));
  });

  it('Test simple statement end with like operator', async () => {
    const sqlWhereConditon = `WHERE name like 'Leanne%'`;
    const parser = new SQLParser();
    const data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(data[0].name).startsWith('Leanne'));
  });

  it('Test simple statement start with like operator and should return []', async () => {
    const sqlWhereConditon = `WHERE name like '%Leanne'`;
    const parser = new SQLParser();
    const data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(data.length).toEqual(0);
  });

  it('Test simple statement end with like operator in middle of the string', async () => {
    const sqlWhereConditon = `WHERE name like 'Leanne%Graham'`;
    const parser = new SQLParser();
    const data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(data[0].name).startsWith('Leanne'));
    expect(String(data[0].name).endsWith('Graham'));
  });

  it('Test simple statement with special characters', async () => {
    let sqlWhereConditon = `WHERE name like 'abc?123$%'`;
    const parser = new SQLParser();
    let data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(data[0].name).startsWith('abc?123$'));

    sqlWhereConditon = `WHERE name like 'a\\%'`;
    data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(data[0].name)).toEqual('a\\bc');

    sqlWhereConditon = `WHERE name like '%$, (, ), *, +, ., [, ], ?, \\, ^, {, }, |%'`;
    data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(String(data[0].name)).toEqual("123'$, (, ), *, +, ., [, ], ?, \\, ^, {, }, |'abc");
  });

  it('Test simple statement with special characters', async () => {
    const sqlWhereConditon = `WHERE name not like 'abc?123$%'`;
    const parser = new SQLParser();
    const data = await TestModel.find(parser.parseSql(sqlWhereConditon));
    expect(!data.some((d: { name: string }) => { d?.name?.startsWith('abc?123$') }));
  });
});
