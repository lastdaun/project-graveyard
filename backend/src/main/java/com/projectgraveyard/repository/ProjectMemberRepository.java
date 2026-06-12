package com.projectgraveyard.repository;

import com.projectgraveyard.entity.Project;
import com.projectgraveyard.entity.ProjectMember;
import com.projectgraveyard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByUserId(Long userId);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    boolean existsByProjectAndUser(Project project, User user);
}
