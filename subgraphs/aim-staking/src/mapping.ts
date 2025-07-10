import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ProjectRegistered,
  ProjectUnregistered,
  Staked,
  Unstaked,
  EmergencyUnstaked,
  ProjectStakingTokenSet
} from "../generated/AimStaking/AimStaking";
import { Project, User, Stake, ProjectUser } from "../generated/schema";

export function handleProjectRegistered(event: ProjectRegistered): void {
  let project = new Project(event.params.projectId);
  project.totalStaked = BigInt.fromI32(0);
  project.userCount = BigInt.fromI32(0);
  project.createdAt = event.block.timestamp;
  project.transactionHash = event.transaction.hash;
  project.registered = true;
  project.save();
}

export function handleProjectUnregistered(event: ProjectUnregistered): void {
  let project = Project.load(event.params.projectId);
  if (project) {
    project.registered = false;
    project.save();
  }
}

export function handleStaked(event: Staked): void {
  let stakeId = event.params.stakeId.toString();
  let userAddress = event.params.user;
  let projectId = event.params.projectId;

  let user = User.load(userAddress);
  if (user == null) {
    user = new User(userAddress);
    user.totalStaked = BigInt.fromI32(0);
    user.activeStakeCount = BigInt.fromI32(0);
  }

  let project = Project.load(projectId);
  if (project == null) {
    // This should not happen if events are processed in order, but as a safeguard:
    project = new Project(projectId);
    project.totalStaked = BigInt.fromI32(0);
    project.userCount = BigInt.fromI32(0);
    project.createdAt = event.block.timestamp;
    project.transactionHash = event.transaction.hash;
    project.registered = true; // Assume registered if we see a stake for it.
  }

  let projectUserId = projectId.toHexString().concat("-").concat(userAddress.toHexString());
  let projectUser = ProjectUser.load(projectUserId);
  if (projectUser == null) {
    projectUser = new ProjectUser(projectUserId);
    projectUser.project = project.id;
    projectUser.user = user.id;
    projectUser.activeStakeCount = BigInt.fromI32(0);
  }

  if (projectUser.activeStakeCount.equals(BigInt.fromI32(0))) {
    project.userCount = project.userCount.plus(BigInt.fromI32(1));
  }
  projectUser.activeStakeCount = projectUser.activeStakeCount.plus(BigInt.fromI32(1));

  let stake = new Stake(stakeId);
  stake.stakeId = event.params.stakeId;
  stake.user = user.id;
  stake.project = project.id;
  stake.amount = event.params.amount;
  stake.duration = event.params.duration;
  stake.stakedAt = event.block.timestamp;
  stake.unlockedAt = event.block.timestamp.plus(event.params.duration);
  stake.status = "Active";

  // The staking token is not part of the event, but it's on the stake struct.
  // We can get it from the project entity, which should be set by `ProjectStakingTokenSet`.
  if (project.stakingToken) {
    stake.stakingToken = project.stakingToken as Bytes;
  } else {
    // Fallback or error. For now, let's use a zero address placeholder.
    stake.stakingToken = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
  }
  stake.transactionHash = event.transaction.hash;

  user.totalStaked = user.totalStaked.plus(stake.amount);
  user.activeStakeCount = user.activeStakeCount.plus(BigInt.fromI32(1));
  project.totalStaked = project.totalStaked.plus(stake.amount);

  stake.save();
  user.save();
  project.save();
  projectUser.save();
}

export function handleUnstaked(event: Unstaked): void {
  let stakeId = event.params.stakeId.toString();
  let stake = Stake.load(stakeId);
  if (stake) {
    stake.status = "Unstaked";

    let user = User.load(stake.user);
    if (user) {
      user.totalStaked = user.totalStaked.minus(stake.amount);
      user.activeStakeCount = user.activeStakeCount.minus(BigInt.fromI32(1));
      user.save();
    }

    let project = Project.load(stake.project);
    if (project) {
      project.totalStaked = project.totalStaked.minus(stake.amount);

      let projectUserId = project.id.toHexString().concat("-").concat(stake.user.toHexString());
      let projectUser = ProjectUser.load(projectUserId);
      if (projectUser) {
        projectUser.activeStakeCount = projectUser.activeStakeCount.minus(BigInt.fromI32(1));
        if (projectUser.activeStakeCount.equals(BigInt.fromI32(0))) {
          project.userCount = project.userCount.minus(BigInt.fromI32(1));
        }
        projectUser.save();
      }
      project.save();
    }
    stake.save();
  }
}

export function handleEmergencyUnstaked(event: EmergencyUnstaked): void {
  let stakeId = event.params.stakeId.toString();
  let stake = Stake.load(stakeId);
  if (stake) {
    stake.status = "EmergencyUnstaked";

    let user = User.load(stake.user);
    if (user) {
      user.totalStaked = user.totalStaked.minus(stake.amount);
      user.activeStakeCount = user.activeStakeCount.minus(BigInt.fromI32(1));
      user.save();
    }

    let project = Project.load(stake.project);
    if (project) {
      project.totalStaked = project.totalStaked.minus(stake.amount);

      let projectUserId = project.id.toHexString().concat("-").concat(stake.user.toHexString());
      let projectUser = ProjectUser.load(projectUserId);
      if (projectUser) {
        projectUser.activeStakeCount = projectUser.activeStakeCount.minus(BigInt.fromI32(1));
        if (projectUser.activeStakeCount.equals(BigInt.fromI32(0))) {
          project.userCount = project.userCount.minus(BigInt.fromI32(1));
        }
        projectUser.save();
      }
      project.save();
    }
    stake.save();
  }
}

export function handleProjectStakingTokenSet(event: ProjectStakingTokenSet): void {
  let projectId = event.params.projectId;
  let project = Project.load(projectId);
  if (project) {
    project.stakingToken = event.params.tokenAddress;
    project.save();
  }
}
