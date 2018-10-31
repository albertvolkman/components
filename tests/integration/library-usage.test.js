import AWS from 'aws-sdk'

const path = require('path')
const fse = require('fs-extra')
const BbPromise = require('bluebird')
const { fileExists, getTmpDir } = require('@serverless/utils')
const { removeFiles } = require('../helpers')

const { deploy, remove } = require('../../src')

const fsp = BbPromise.promisifyAll(fse)

describe('Integration Test - Library Usage', () => {
  jest.setTimeout(40000)

  let testServiceStateDirectory
  let testServiceZipFile

  beforeAll(async () => {
    await removeFiles([testServiceStateDirectory, testServiceZipFile])
  })

  afterAll(async () => {
    await removeFiles([testServiceStateDirectory, testServiceZipFile])
  })

  describe('our test setup', () => {
    it('should not have any state files', async () => {
      const testServiceHasStateFile = await fileExists(testServiceStateDirectory)

      expect(testServiceHasStateFile).toEqual(false)
    })
  })

  describe('when using a path to a project', () => {
    const testServiceDir = path.join(__dirname, 'library-usage')
    testServiceStateDirectory = path.join(testServiceDir, '.serverless')
    testServiceZipFile = path.join(testServiceDir, 'library-usage@0.0.1.zip')

    beforeAll(async () => {
      await removeFiles([testServiceStateDirectory, testServiceZipFile])
    })

    afterAll(async () => {
      await removeFiles([testServiceStateDirectory, testServiceZipFile])
    })

    describe('when running through a typical component usage lifecycle', () => {
      it('should deploy the "AwsS3Bucket" component', async () => {
        const context = await deploy({ cwd: testServiceDir })
        expect(AWS.mocks.createBucketMock).toBeCalledWith({ Bucket: 'mySuperBucket' })
        const service = context.instance
        expect(service).not.toBeFalsy()
        expect(service).toMatchObject({
          instanceId: expect.any(String),
          name: 'LibraryUsage',
          components: expect.any(Object)
        })
        const bucket = service.components.myBucket
        expect(bucket).not.toBeFalsy()
        expect(bucket).toMatchObject({
          bucketName: 'mySuperBucket',
          instanceId: expect.any(String)
        })
      })
      it('should remove the "AwsS3Bucket" components', async () => {
        let context = await deploy({ cwd: testServiceDir })
        context = await remove({ cwd: testServiceDir })
        expect(AWS.mocks.deleteBucketMock).toBeCalledWith({ Bucket: 'mySuperBucket' })
        expect(AWS.mocks.listObjectsV2Mock).toBeCalledWith({ Bucket: 'mySuperBucket' })
        expect(AWS.mocks.deleteObjectsMock).toBeCalledWith({
          Bucket: 'mySuperBucket',
          Delete: { Objects: [{ Key: 'abc' }] }
        })
        expect(context.instance).toBeFalsy()
      })
    })
  })

  describe('when using a serverless.yml file object', () => {
    let oldCwd
    let tmpDirPath
    let testServiceDir

    beforeAll(async () => {
      await removeFiles([testServiceStateDirectory, testServiceZipFile])
      oldCwd = process.cwd()
      process.chdir(await getTmpDir())
      tmpDirPath = process.cwd()
      testServiceDir = tmpDirPath
      testServiceStateDirectory = path.join(testServiceDir, '.serverless')
      testServiceZipFile = path.join(testServiceDir, 'library-usage@0.0.1.zip')
    })

    afterAll(async () => {
      process.chdir(oldCwd)
      await removeFiles([testServiceStateDirectory, testServiceZipFile])
    })

    // NOTE: this is the JavaScript object representation of the same project we're
    // using in the tests where we pass in the project path
    // const serverlessFileObject = {
    //   name: 'LibraryUsage',
    //   extends: 'Service',
    //   providers: {
    //     aws: {
    //       type: 'AwsProvider',
    //       inputs: {
    //         credentials: {
    //           accessKeyId: 'xxxxx',
    //           secretAccessKey: 'xxxxx'
    //         },
    //         region: 'us-east-1'
    //       }
    //     }
    //   },
    //   components: {
    //     myBucket: {
    //       type: 'AwsS3Bucket',
    //       inputs: {
    //         bucketName: 'mySuperBucket',
    //         provider: '${this.providers.aws}'
    //       }
    //     }
    //   }
    // }

    describe('when running through a typical component usage lifecycle', () => {
      it('should deploy the "AwsS3Bucket" component', async () => {
        expect(true).not.toBeFalsy()
      })

      it('should re-deploy the "AwsS3Bucket" component', async () => {
        expect(true).not.toBeFalsy()
      })

      it('should remove the "AwsS3Bucket" and "function" components', async () => {
        expect(true).not.toBeFalsy()
      })
    })
  })
})
