export const FetchFile = `
  query FetchFile($projectUuid: ID!, $suiteUuid: ID!, $bucket: String!) {
    fetchFile(projectUuid: $projectUuid, suiteUuid: $suiteUuid, bucket: $bucket)
  }
`;

export const DispatchAgent = `
  mutation DispatchAgent(
    $input: TestCasesInput!
  ) {
    dispatchAgent(input: $input)
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

export const UpdateFile = `
  mutation UpdateFile($input: UpdateFileInput!) {
    updateFile(input: $input)
  }
`;
