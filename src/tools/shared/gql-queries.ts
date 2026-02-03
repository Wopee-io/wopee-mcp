export const FetchArtifact = `
  query FetchArtifact($input: FetchArtifactInput!) {
    fetchArtifact(input: $input) {
      content
      blobSha
      commitSha
      commitDate
    }
  }
`;

export const UpdateArtifact = `
  mutation Mutation($input: UpdateArtifactInput!) {
    updateArtifact(input: $input)
  }
`;

export const DispatchAgent = `
  mutation DispatchAgent(
    $input: TestCasesInput!
  ) {
    dispatchAgent(input: $input) {
      uuid
      projectUuid
      suiteUuid
      analysisSuiteUuid
      analysisIdentifier
      userStoryId
      testCaseId
      executionStatus
      agentReport
      agentReportStatus
      codeReport
      codeReportStatus
      createdAt
      updatedAt
    }
  }
`;

export const DispatchAnalysis = `
  mutation DispatchAnalysis($input: DispatchAnalysisInput!) {
    dispatchAnalysis(input: $input) {
      uuid
      name
      createdAt
      updatedAt
      suiteType
      analysisIdentifier
      suiteRunningStatus
      generatedAnalysisDataState {
        suiteUuid
        appContext {
          status
          isGenerated
        }
        generalUserStories {
          status
          isGenerated
        }
        userStories {
          status
          isGenerated
        }
        testCases {
          status
          isGenerated
        }
        reusableTestCases {
          status
          isGenerated
        }
        testCaseSteps
      }
    }
  }
`;

export const FetchAnalysisSuites = `
  query FetchAnalysisSuites($projectUuid: ID!) {
    fetchAnalysisSuites(projectUuid: $projectUuid) {
      uuid
      name
      suiteType
      executionStatus
      analysisIdentifier
      suiteRunningStatus
      createdAt
      updatedAt
      generatedAnalysisDataState {
        uuid
        suiteUuid
        appContext {
          uuid
          isGenerated
          status
        }
        generalUserStories {
          uuid
          isGenerated
          status
        }
        userStories {
          uuid
          isGenerated
          status
        }
        testCases {
          uuid
          isGenerated
          status
        }
        reusableTestCases {
          uuid
          isGenerated
          status
        }
        testCaseSteps
      }
    }
  }
`;

export const GenerateAppContext = `
  mutation GenerateAppContext(
    $input: GenerateAIDataInput!
  ) {
    generateAppContext(input: $input)
  }
`;

export const GenerateGeneralUserStories = `
  mutation GenerateGeneralUserStories(
    $input: GenerateAIDataInput!
  ) {
    generateGeneralUserStories(input: $input)
  }
`;

export const GenerateUserStoriesWithTestCases = `
  mutation GenerateUserStoriesWithTestCases($input: GenerateAIDataInput!) {
    generateUserStories(input: $input)
  }
`;

export const GenerateTestCases = `
 mutation GenerateTestCases($input: GenerateAIDataInput!) {
    generateTestCases(input: $input)
  }
`;

export const GenerateTestCaseSteps = `
 mutation GenerateTestCaseSteps($input: GenerateAIDataInput!) {
    generateTestCaseSteps(input: $input)
  }
`;

export const GenerateReusableTestCases = `
  mutation GenerateReusableTestCases($input: GenerateAIDataInput!) {
    generateReusableTestCases(input: $input)
  }
`;

export const GenerateReusableTestCaseSteps = `
  mutation GenerateReusableTestCaseSteps($input: GenerateAIDataInput!) {
    generateReusableTestCaseSteps(input: $input)
  }
`;

export const CreateBlankAnalysisSuite = `
  mutation CreateBlankAnalysisSuite($projectUuid: ID!) {
    createBlankAnalysisSuite(projectUuid: $projectUuid) {
      uuid
      name
      suiteType
      executionStatus
      createdAt
      updatedAt
      analysisIdentifier
      suiteRunningStatus
      generatedAnalysisDataState {
        suiteUuid
        appContext {
          isGenerated
          status
        }
        generalUserStories {
          isGenerated
          status
        }
        userStories {
          isGenerated
          status
        }
        testCases {
          isGenerated
          status
        }
        reusableTestCases {
          isGenerated
          status
        }
        testCaseSteps
      }
    }
  }
`;
